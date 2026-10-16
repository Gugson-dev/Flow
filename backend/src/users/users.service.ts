
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        autoAcceptInvites: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'Użytkownik nie istnieje',
      );
    }

    return user;
  }

  async updateInvitationSettings(
    userId: string,
    autoAcceptInvites: boolean,
  ) {
    const result = await this.prisma.user.updateMany({
      where: { id: userId },
      data: { autoAcceptInvites },
    });

    if (result.count === 0) {
      throw new NotFoundException(
        'Użytkownik nie istnieje',
      );
    }

    return this.getMe(userId);
  }
}
