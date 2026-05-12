import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [TasksController],
  providers: [TasksService, RealtimeGateway],
})
export class TasksModule {}