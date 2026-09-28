import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
  ) {
    const existingUser =
      await this.prisma.user.findUnique({
        where: { email },
      });

    if (existingUser) {
      throw new ConflictException(
        'Użytkownik o tym adresie email już istnieje',
      );
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const user =
      await this.prisma.user.create({
        data: {
          email,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });

    return user;
  }

  async login(
  email: string,
  password: string,
) {
  const user = await this.prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedException(
      'Nieprawidłowy email lub hasło',
    );
  }

  const passwordValid = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!passwordValid) {
    throw new UnauthorizedException(
      'Nieprawidłowy email lub hasło',
    );
  }

  const accessToken = this.jwtService.sign({
  sub: user.id,
  email: user.email,
  });

  return {
    access_token: accessToken,
  };
}
}