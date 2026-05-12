import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private realtime: RealtimeGateway,
  ) {}

  async findAll() {
    return this.prisma.project.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(data: any) {
    const project = await this.prisma.project.create({
      data,
    });

    this.realtime.emitProjectsUpdated();

    return project;
  }

  async update(id: string, data: any) {
    const project = await this.prisma.project.update({
      where: { id },
      data,
    });

    this.realtime.emitProjectsUpdated();

    return project;
  }

  async delete(id: string) {
    await this.prisma.project.delete({
      where: { id },
    });

    this.realtime.emitProjectsUpdated();

    return {
      success: true,
    };
  }
}