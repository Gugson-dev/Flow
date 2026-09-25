import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { PrismaModule } from './prisma/prisma.module'
import { ProjectsModule } from './projects/projects.module';
import { RealtimeGateway } from './realtime/realtime.gateway';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [TasksModule, AuthModule, PrismaModule, ProjectsModule, ConfigModule.forRoot({
      isGlobal: true,
    })],
  controllers: [AppController],
  providers: [AppService, RealtimeGateway],
})
export class AppModule {}
