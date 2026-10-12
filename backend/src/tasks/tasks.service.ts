
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

  private async resolveProjectId(
    userId: string,
    projectId?: string | null,
  ): Promise<string> {
    if (projectId) {
      const project = await this.prisma.project.findFirst({
        where: {
          id: projectId,
          ownerId: userId,
        },
      });

      if (!project) {
        throw new NotFoundException(
          'Projekt nie istnieje lub nie masz do niego dostępu',
        );
      }

      return project.id;
    }

    const inbox = await this.prisma.project.findFirst({
      where: {
        ownerId: userId,
        isSystem: true,
        name: 'Inbox',
      },
    });

    if (!inbox) {
      throw new BadRequestException(
        'Użytkownik nie ma projektu Inbox',
      );
    }

    return inbox.id;
  }

  async findAll(userId: string) {
    return this.prisma.task.findMany({
      where: {
        project: {
          ownerId: userId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

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
        projectId,
      },
    });

    this.realtime.emitTasksUpdated(userId);

    return task;
  }

  async update(id: string, userId: string, data: any) {
    const existingTask = await this.prisma.task.findFirst({
      where: {
        id,
        project: {
          ownerId: userId,
        },
      },
    });

    if (!existingTask) {
      throw new NotFoundException(
        'Zadanie nie istnieje lub nie masz do niego dostępu',
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
          ownerId: userId,
        },
      },
      data: changes,
    });

    if (result.count === 0) {
      throw new NotFoundException(
        'Zadanie nie istnieje lub nie masz do niego dostępu',
      );
    }

    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    this.realtime.emitTasksUpdated(userId);

    return task;
  }

  async toggle(
    id: string,
    userId: string,
    completed?: boolean,
  ) {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        project: {
          ownerId: userId,
        },
      },
    });

    if (!task) {
      throw new NotFoundException(
        'Zadanie nie istnieje lub nie masz do niego dostępu',
      );
    }

    return this.update(id, userId, {
      completed: completed ?? !task.completed,
    });
  }

  async delete(id: string, userId: string) {
    const existingTask = await this.prisma.task.findFirst({
      where: {
        id,
        project: {
          ownerId: userId,
        },
      },
    });

    if (!existingTask) {
      throw new NotFoundException(
        'Zadanie nie istnieje lub nie masz do niego dostępu',
      );
    }

    const result = await this.prisma.task.deleteMany({
      where: {
        id,
        project: {
          ownerId: userId,
        },
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(
        'Zadanie nie istnieje lub nie masz do niego dostępu',
      );
    }

    this.realtime.emitTasksUpdated(userId);

    return existingTask;
  }

  async clearCompleted(userId: string) {
    const result = await this.prisma.task.deleteMany({
      where: {
        completed: true,
        project: {
          ownerId: userId,
        },
      },
    });

    this.realtime.emitTasksUpdated(userId);

    return {
      success: true,
      deletedCount: result.count,
    };
  }
}
