
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

import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  getAll(@Req() req: AuthenticatedRequest) {
    return this.projectsService.findAll(req.user.id);
  }

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() body: any,
  ) {
    return this.projectsService.create(req.user.id, body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: any,
  ) {
    return this.projectsService.update(
      id,
      req.user.id,
      body,
    );
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.projectsService.delete(
      id,
      req.user.id,
    );
  }
}
