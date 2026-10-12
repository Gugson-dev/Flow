
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
  ) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.tasksService.findAll(req.user.id);
  }

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() body: any,
  ) {
    return this.tasksService.create(req.user.id, body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: any,
  ) {
    return this.tasksService.update(
      id,
      req.user.id,
      body,
    );
  }

  @Post(':id/toggle')
  toggle(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: { completed?: boolean },
  ) {
    return this.tasksService.toggle(
      id,
      req.user.id,
      body.completed,
    );
  }

  @Post(':id')
  remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tasksService.delete(id, req.user.id);
  }

  @Delete()
  clearCompleted(@Req() req: AuthenticatedRequest) {
    return this.tasksService.clearCompleted(req.user.id);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tasksService.delete(id, req.user.id);
  }
}
