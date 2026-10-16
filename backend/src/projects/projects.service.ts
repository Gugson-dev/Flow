
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
  // WALIDACJA PROJEKTU NADRZĘDNEGO
  // =========================================

  private async validateParent(
    userId: string,
    parentId: string | null,
    projectId?: string,
  ): Promise<void> {
    if (parentId === null) {
      return;
    }

    if (parentId === projectId) {
      throw new BadRequestException(
        'Projekt nie może być własnym rodzicem',
      );
    }

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
        ownerId: userId,
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
          connect: {
            id: userId,
          },
        },
        ...(data.parentId != null && {
          parent: {
            connect: {
              id: data.parentId,
            },
          },
        }),
      },
    });

    this.realtime.emitProjectsUpdated(userId);

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

    if (parentId !== undefined && parentId !== null) {
      await this.validateParent(userId, parentId, id);
    }

    const project = await this.prisma.project.update({
      where: {
        id,
        ownerId: userId,
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

    this.realtime.emitProjectsUpdated(userId);

    return project;
  }

  // =========================================
  // USUWANIE PROJEKTU
  // =========================================

  async delete(id: string, userId: string) {
    const result = await this.prisma.project.deleteMany({
      where: {
        id,
        ownerId: userId,
        isSystem: false,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(
        'Projekt nie istnieje, jest systemowy lub nie masz do niego dostępu',
      );
    }

    this.realtime.emitProjectsUpdated(userId);
    this.realtime.emitTasksUpdated(userId);

    return {
      success: true,
    };
  }
}
