
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  // =========================================
  // UPRAWNIENIA
  // =========================================

  private readableProject(userId: string) {
    return {
      OR: [
        { ownerId: userId },
        {
          members: {
            some: { userId },
          },
        },
      ],
    };
  }

  private writableProject(userId: string) {
    return {
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId,
              role: 'EDITOR' as const,
            },
          },
        },
      ],
    };
  }

  // =========================================
  // POWIADOMIENIA
  // =========================================

  private async notifyProjectUsers(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        ownerId: true,
        members: {
          select: { userId: true },
        },
      },
    });

    if (!project) return;

    const userIds = new Set([
      project.ownerId,
      ...project.members.map((member) => member.userId),
    ]);

    for (const userId of userIds) {
      this.realtime.emitTasksUpdated(userId);
    }
  }

  // =========================================
  // ROZWIĄZYWANIE PROJEKTU
  // =========================================

  private async resolveProjectId(
    userId: string,
    projectId?: string | null,
  ): Promise<string> {
    if (projectId) {
      const project = await this.prisma.project.findFirst({
        where: {
          id: projectId,
          ...this.writableProject(userId),
        },
        select: { id: true },
      });

      if (!project) {
        throw new NotFoundException(
          'Projekt nie istnieje lub nie masz uprawnień do edycji',
        );
      }

      return project.id;
    }

    // Brak projectId oznacza prywatny Inbox.
    const inbox = await this.prisma.project.findFirst({
      where: {
        ownerId: userId,
        isSystem: true,
        name: 'Inbox',
      },
      select: { id: true },
    });

    if (!inbox) {
      throw new BadRequestException(
        'Użytkownik nie ma projektu Inbox',
      );
    }

    return inbox.id;
  }

  // =========================================
  // POBIERANIE ZADAŃ
  // =========================================

  async findAll(userId: string) {
    return this.prisma.task.findMany({
      where: {
        project: {
          is: this.readableProject(userId),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // =========================================
  // TWORZENIE ZADANIA
  // =========================================

  async create(userId: string, data: any) {
    const projectId = await this.resolveProjectId(
      userId,
      data.projectId,
    );

    const task = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        date: data.date,
        endDate: data.endDate,
        completed: data.completed ?? false,
        assignedTo: data.assignedTo,
        project: {
          connect: { id: projectId },
        },
      },
    });

    await this.notifyProjectUsers(projectId);

    return task;
  }

  // =========================================
  // AKTUALIZACJA ZADANIA
  // =========================================

  async update(id: string, userId: string, data: any) {
    const existingTask = await this.prisma.task.findFirst({
      where: {
        id,
        project: {
          is: this.writableProject(userId),
        },
      },
    });

    if (!existingTask) {
      throw new NotFoundException(
        'Zadanie nie istnieje lub nie masz uprawnień do edycji',
      );
    }

    let projectId: string | undefined;

    if (data.projectId !== undefined) {
      projectId = await this.resolveProjectId(
        userId,
        data.projectId,
      );
    }

    const changes = {
      ...(data.title !== undefined && {
        title: data.title,
      }),
      ...(data.description !== undefined && {
        description: data.description,
      }),
      ...(data.priority !== undefined && {
        priority: data.priority,
      }),
      ...(data.date !== undefined && {
        date: data.date,
      }),
      ...(data.endDate !== undefined && {
        endDate: data.endDate,
      }),
      ...(data.completed !== undefined && {
        completed: data.completed,
      }),
      ...(data.assignedTo !== undefined && {
        assignedTo: data.assignedTo,
      }),
      ...(projectId !== undefined && {
        projectId,
      }),
    };

    const result = await this.prisma.task.updateMany({
      where: {
        id,
        project: {
          is: this.writableProject(userId),
        },
      },
      data: changes,
    });

    if (result.count !== 1) {
      throw new NotFoundException(
        'Zadanie nie istnieje lub nie masz uprawnień do edycji',
      );
    }

    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (existingTask.projectId) {
      await this.notifyProjectUsers(existingTask.projectId);
    }

    if (
      projectId &&
      projectId !== existingTask.projectId
    ) {
      await this.notifyProjectUsers(projectId);
    }

    return task;
  }

  // =========================================
  // PRZEŁĄCZANIE UKOŃCZENIA
  // =========================================

  async toggle(
    id: string,
    userId: string,
    completed?: boolean,
  ) {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        project: {
          is: this.writableProject(userId),
        },
      },
    });

    if (!task) {
      throw new NotFoundException(
        'Zadanie nie istnieje lub nie masz uprawnień do edycji',
      );
    }

    return this.update(id, userId, {
      completed: completed ?? !task.completed,
    });
  }

  // =========================================
  // USUWANIE ZADANIA
  // =========================================

  async delete(id: string, userId: string) {
    const existingTask = await this.prisma.task.findFirst({
      where: {
        id,
        project: {
          is: this.writableProject(userId),
        },
      },
    });

    if (!existingTask) {
      throw new NotFoundException(
        'Zadanie nie istnieje lub nie masz uprawnień do usunięcia',
      );
    }

    const result = await this.prisma.task.deleteMany({
      where: {
        id,
        project: {
          is: this.writableProject(userId),
        },
      },
    });

    if (result.count !== 1) {
      throw new NotFoundException(
        'Zadanie nie istnieje lub nie masz uprawnień do usunięcia',
      );
    }

    if (existingTask.projectId) {
      await this.notifyProjectUsers(existingTask.projectId);
    }

    return existingTask;
  }

  // =========================================
  // USUWANIE UKOŃCZONYCH ZADAŃ
  // =========================================

  async clearCompleted(userId: string) {
    const where = {
      completed: true,
      project: {
        is: this.writableProject(userId),
      },
    };

    const tasks = await this.prisma.task.findMany({
      where,
      select: {
        projectId: true,
      },
    });

    const result = await this.prisma.task.deleteMany({
      where,
    });

    const projectIds = new Set(
      tasks
        .map((task) => task.projectId)
        .filter((id): id is string => id !== null),
    );

    for (const projectId of projectIds) {
      await this.notifyProjectUsers(projectId);
    }

    return {
      success: true,
      deletedCount: result.count,
    };
  }
}
