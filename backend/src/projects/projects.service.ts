import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.project.create({ data });
  }

  findAll() {
    return this.prisma.project.findMany({
      include: {
        tasks: true,
      },
    });
  }

  update(id: string, data: any) {
    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.project.delete({
      where: { id },
    });
  }
}