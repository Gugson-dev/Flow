
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { InvitationsService } from './invitations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

@Controller('invitations')
@UseGuards(JwtAuthGuard)
export class InvitationsController {
  constructor(
    private readonly invitationsService: InvitationsService,
  ) {}

  @Post()
  send(
    @Req() req: AuthenticatedRequest,
    @Body() body: {
      projectId?: unknown;
      email?: unknown;
    },
  ) {
    if (
      typeof body?.projectId !== 'string' ||
      !body.projectId.trim() ||
      typeof body?.email !== 'string' ||
      !body.email.trim()
    ) {
      throw new BadRequestException(
        'Podaj poprawny projectId oraz email',
      );
    }

    return this.invitationsService.send(
      req.user.id,
      body.projectId,
      body.email,
    );
  }

  @Get('received')
  received(@Req() req: AuthenticatedRequest) {
    return this.invitationsService.received(req.user.id);
  }

  @Get('sent')
  sent(@Req() req: AuthenticatedRequest) {
    return this.invitationsService.sent(req.user.id);
  }

  @Patch(':id/accept')
  accept(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.invitationsService.accept(id, req.user.id);
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.invitationsService.reject(id, req.user.id);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.invitationsService.cancel(id, req.user.id);
  }
}
