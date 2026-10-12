
import {
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

  async create(userId: string, data: any) {
    const project = await this.prisma.project.create({
      data: {
        name: data.name,
        color: data.color,
        theme: data.theme,
        customColor: data.customColor,
        parentId: data.parentId,
        sharedWith: [],
        isSystem: false,
        owner: {
          connect: {
            id: userId,
          },
        },
      },
    });

    this.realtime.emitProjectsUpdated();

    return project;
  }

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

    const { name, color, theme, customColor, parentId } = data;

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
        ...(parentId !== undefined && { parentId }),
      },
    });

    this.realtime.emitProjectsUpdated();

    return project;
  }

  async delete(id: string, userId: string) {
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
      throw new NotFoundException(
        'Nie można usunąć projektu systemowego',
      );
    }

    await this.prisma.project.delete({
      where: {
        id,
        ownerId: userId,
      },
    });

    this.realtime.emitProjectsUpdated();

    return {
      success: true,
    };
  }
}
