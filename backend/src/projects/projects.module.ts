import { Module } from '@nestjs/common';

import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, RealtimeGateway],
})
export class ProjectsModule {}