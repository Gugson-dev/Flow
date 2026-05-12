import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class TasksService {

  constructor(private prisma: PrismaService, private realtime: RealtimeGateway) {}

  async create(data: any) {
    const task = await this.prisma.task.create({
      data,
    });

    this.realtime.emitTasksUpdated();

    return task;
  }

  async findAll() {
    return this.prisma.task.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, data: any) {
    const task = await this.prisma.task.update({
      where: { id },
      data,
    });

    this.realtime.emitTasksUpdated();

    return task;
  }

  async delete(id: string) {
    const task = await this.prisma.task.delete({
      where: { id },
    });

    this.realtime.emitTasksUpdated();

    return task;
  }
}

