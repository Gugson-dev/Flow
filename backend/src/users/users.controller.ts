
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get('me')
  getMe(@Req() req: AuthenticatedRequest) {
    return this.usersService.getMe(req.user.id);
  }

  @Patch('me/settings')
  updateSettings(
    @Req() req: AuthenticatedRequest,
    @Body() body: { autoAcceptInvites?: unknown },
  ) {
    if (typeof body?.autoAcceptInvites !== 'boolean') {
      throw new BadRequestException(
        'autoAcceptInvites musi być wartością true lub false',
      );
    }

    return this.usersService.updateInvitationSettings(
      req.user.id,
      body.autoAcceptInvites,
    );
  }
}
