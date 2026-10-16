
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =========================================
  // WYSYŁANIE ZAPROSZENIA
  // =========================================

  async send(
    senderId: string,
    projectId: string,
    receiverEmail: string,
  ) {
    const email = receiverEmail.trim().toLowerCase();

    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: senderId,
        isSystem: false,
      },
    });

    if (!project) {
      throw new ForbiddenException(
        'Nie możesz zapraszać do tego projektu',
      );
    }

    const receiver = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!receiver) {
      throw new NotFoundException(
        'Nie znaleziono użytkownika o podanym adresie e-mail',
      );
    }

    if (receiver.id === senderId) {
      throw new BadRequestException(
        'Nie możesz zaprosić samego siebie',
      );
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingMember = await tx.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId,
              userId: receiver.id,
            },
          },
        });

        if (existingMember) {
          throw new ConflictException(
            'Użytkownik jest już członkiem projektu',
          );
        }

        const pending = await tx.projectInvitation.findFirst({
          where: {
            projectId,
            receiverId: receiver.id,
            status: 'PENDING',
          },
        });

        if (pending) {
          throw new ConflictException(
            'Użytkownik ma już oczekujące zaproszenie',
          );
        }

        const autoAccept = receiver.autoAcceptInvites;

        const invitation = await tx.projectInvitation.create({
          data: {
            projectId,
            senderId,
            receiverId: receiver.id,
            status: autoAccept ? 'ACCEPTED' : 'PENDING',
            respondedAt: autoAccept ? new Date() : null,
          },
        });

        if (autoAccept) {
          await tx.projectMember.create({
            data: {
              projectId,
              userId: receiver.id,
              role: 'EDITOR',
            },
          });
        }

        return invitation;
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(
          'Zaproszenie lub członkostwo już istnieje',
        );
      }
      throw error;
    }
  }

  // =========================================
  // OTRZYMANE ZAPROSZENIA
  // =========================================

  async received(userId: string) {
    return this.prisma.projectInvitation.findMany({
      where: {
        receiverId: userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        sender: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // =========================================
  // WYSŁANE ZAPROSZENIA
  // =========================================

  async sent(userId: string) {
    return this.prisma.projectInvitation.findMany({
      where: {
        senderId: userId,
        project: { ownerId: userId },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // =========================================
  // AKCEPTOWANIE ZAPROSZENIA
  // =========================================

  async accept(invitationId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const invitation = await tx.projectInvitation.findFirst({
        where: {
          id: invitationId,
          receiverId: userId,
          status: 'PENDING',
        },
      });

      if (!invitation) {
        throw new NotFoundException(
          'Nie znaleziono oczekującego zaproszenia',
        );
      }

      const updated = await tx.projectInvitation.updateMany({
        where: {
          id: invitationId,
          receiverId: userId,
          status: 'PENDING',
        },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      });

      if (updated.count !== 1) {
        throw new ConflictException(
          'Zaproszenie zostało już rozpatrzone',
        );
      }

      await tx.projectMember.upsert({
        where: {
          projectId_userId: {
            projectId: invitation.projectId,
            userId,
          },
        },
        create: {
          projectId: invitation.projectId,
          userId,
          role: 'EDITOR',
        },
        update: {},
      });

      return { success: true, status: 'ACCEPTED' };
    });
  }

  // =========================================
  // ODRZUCANIE ZAPROSZENIA
  // =========================================

  async reject(invitationId: string, userId: string) {
    const result = await this.prisma.projectInvitation.updateMany({
      where: {
        id: invitationId,
        receiverId: userId,
        status: 'PENDING',
      },
      data: {
        status: 'REJECTED',
        respondedAt: new Date(),
      },
    });

    if (result.count !== 1) {
      throw new NotFoundException(
        'Nie znaleziono oczekującego zaproszenia',
      );
    }

    return { success: true, status: 'REJECTED' };
  }

  // =========================================
  // ANULOWANIE ZAPROSZENIA
  // =========================================

  async cancel(invitationId: string, userId: string) {
    const result = await this.prisma.projectInvitation.updateMany({
      where: {
        id: invitationId,
        status: 'PENDING',
        senderId: userId,
        project: {
          ownerId: userId,
        },
      },
      data: {
        status: 'CANCELLED',
        respondedAt: new Date(),
      },
    });

    if (result.count !== 1) {
      throw new NotFoundException(
        'Nie znaleziono zaproszenia, które można anulować',
      );
    }

    return { success: true, status: 'CANCELLED' };
  }
}
