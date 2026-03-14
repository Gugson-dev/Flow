import { Controller, Get, Post, Body } from '@nestjs/common'
import { TasksService } from './tasks.service'

@Controller('tasks')
export class TasksController {

  constructor(private tasksService: TasksService) {}

  @Post()
  create(@Body() body: { content: string }) {
    return this.tasksService.create(body.content)
  }

  @Get()
  findAll() {
    return this.tasksService.findAll()
  }
}