
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL,
  },
})
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;

      if (typeof token !== 'string' || !token) {
        client.disconnect(true);
        return;
      }

      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(token);

      if (!payload.sub || !payload.email) {
        client.disconnect(true);
        return;
      }

      // Prywatny pokój użytkownika
      await client.join(`user:${payload.sub}`);
    } catch {
      client.disconnect(true);
    }
  }

  emitTasksUpdated(userId: string) {
    this.server
      .to(`user:${userId}`)
      .emit('tasksUpdated');
  }

  emitProjectsUpdated(userId: string) {
    this.server
      .to(`user:${userId}`)
      .emit('projectsUpdated');
  }
}
