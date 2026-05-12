import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common'
import { TasksService } from './tasks.service'

@Controller('tasks')
export class TasksController {

  constructor(private tasksService: TasksService) {}

  @Post()
  create(@Body() body: { content: string }) {
    return this.tasksService.create(body)
  }

  @Post(':id/toggle')
  async toggle(@Body() body: { id: string; completed: boolean }) {
    return this.tasksService.update(body.id, body.completed)
  }

  @Post(':id')
  async remove(@Body() body: { id: string }) {
    return this.tasksService.delete(body.id)
  }

  @Delete()
  async clearCompleted() {
    const tasks = await this.tasksService.findAll()
    return Promise.all(tasks.filter((task) => task.completed).map((task) => this.tasksService.delete(task.id)))
  }

  @Delete(':id')
    delete(@Param('id') id: string) {
      return this.tasksService.delete(id)
}

  @Get()
  findAll() {
    return this.tasksService.findAll()
  }
}