
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  // =========================================
  // POWIADOMIENIA DLA UCZESTNIKÓW
  // =========================================

  private async getProjectUsers(projectId: string): Promise<string[]> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        ownerId: true,
        members: {
          select: { userId: true },
        },
      },
    });

    if (!project) return [];

    return [
      ...new Set([
        project.ownerId,
        ...project.members.map((member) => member.userId),
      ]),
    ];
  }

  private notifyUsers(
    userIds: Iterable<string>,
    includeTasks = false,
  ) {
    for (const userId of new Set(userIds)) {
      this.realtime.emitProjectsUpdated(userId);

      if (includeTasks) {
        this.realtime.emitTasksUpdated(userId);
      }
    }
  }

  // =========================================
  // WALIDACJA HIERARCHII
  // =========================================

  private async validateParent(
    userId: string,
    parentId: string | null,
    projectId?: string,
  ): Promise<void> {
    if (parentId === null) return;

    const visited = new Set<string>();
    let currentId: string | null = parentId;

    while (currentId !== null) {
      if (currentId === projectId || visited.has(currentId)) {
        throw new BadRequestException(
          'Nie można utworzyć cyklicznej hierarchii projektów',
        );
      }

      visited.add(currentId);

      const current: {
        id: string;
        parentId: string | null;
      } | null = await this.prisma.project.findFirst({
        where: {
          id: currentId,
          ownerId: userId,
        },
        select: {
          id: true,
          parentId: true,
        },
      });

      if (!current) {
        throw new NotFoundException(
          'Projekt nadrzędny nie istnieje lub nie masz do niego dostępu',
        );
      }

      currentId = current.parentId;
    }
  }

  // =========================================
  // POBIERANIE PROJEKTÓW
  // =========================================

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // =========================================
  // TWORZENIE PROJEKTU
  // =========================================

  async create(userId: string, data: any) {
    if (data.parentId != null) {
      await this.validateParent(userId, data.parentId);
    }

    const project = await this.prisma.project.create({
      data: {
        name: data.name,
        color: data.color,
        theme: data.theme,
        customColor: data.customColor,
        sharedWith: [],
        isSystem: false,

        owner: {
          connect: { id: userId },
        },

        ...(data.parentId != null && {
          parent: {
            connect: { id: data.parentId },
          },
        }),
      },
    });

    this.notifyUsers([userId]);

    return project;
  }

  // =========================================
  // AKTUALIZACJA PROJEKTU
  // =========================================

  async update(id: string, userId: string, data: any) {
    const existingProject = await this.prisma.project.findFirst({
      where: {
        id,
        ownerId: userId,
      },
    });

    if (!existingProject) {
      throw new NotFoundException(
        'Projekt nie istnieje lub nie masz do niego dostępu',
      );
    }

    if (existingProject.isSystem) {
      throw new BadRequestException(
        'Nie można modyfikować projektu systemowego',
      );
    }

    const {
      name,
      color,
      theme,
      customColor,
      parentId,
    } = data;

    if (parentId != null) {
      await this.validateParent(userId, parentId, id);
    }

    const project = await this.prisma.project.update({
      where: {
        id,
        ownerId: userId,
        isSystem: false,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(color !== undefined && { color }),
        ...(theme !== undefined && { theme }),
        ...(customColor !== undefined && { customColor }),
        ...(parentId !== undefined && {
          parent: parentId === null
            ? { disconnect: true }
            : { connect: { id: parentId } },
        }),
      },
    });

    const recipients = await this.getProjectUsers(id);
    this.notifyUsers(recipients);

    return project;
  }

  // =========================================
  // USUWANIE PROJEKTU I PODPROJEKTÓW
  // =========================================

  async delete(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        ownerId: userId,
        isSystem: false,
      },
    });

    if (!project) {
      throw new NotFoundException(
        'Projekt nie istnieje, jest systemowy lub nie masz do niego dostępu',
      );
    }

    // Przed kaskadowym usunięciem pobieramy użytkowników
    // z całego drzewa projektów.
    const allProjects = await this.prisma.project.findMany({
      select: {
        id: true,
        parentId: true,
        ownerId: true,
        isSystem: true,
        members: {
          select: { userId: true },
        },
      },
    });

    const projectIds = new Set<string>([id]);
    const recipients = new Set<string>([userId]);

    let changed = true;

    while (changed) {
      changed = false;

      for (const item of allProjects) {
        if (
          item.parentId &&
          projectIds.has(item.parentId) &&
          !projectIds.has(item.id)
        ) {
          projectIds.add(item.id);
          changed = true;
        }
      }
    }

    for (const item of allProjects) {
      if (!projectIds.has(item.id)) continue;

      if (item.ownerId !== userId || item.isSystem) {
        throw new BadRequestException(
          'Nie można usunąć hierarchii zawierającej cudzy lub systemowy projekt',
        );
      }

      recipients.add(item.ownerId);

      for (const member of item.members) {
        recipients.add(member.userId);
      }
    }

    const result = await this.prisma.project.deleteMany({
      where: {
        id,
        ownerId: userId,
        isSystem: false,
      },
    });

    if (result.count !== 1) {
      throw new NotFoundException(
        'Projekt nie istnieje lub nie masz do niego dostępu',
      );
    }

    // PostgreSQL usuwa podprojekty i zadania przez CASCADE.
    this.notifyUsers(recipients, true);

    return { success: true };
  }
}
