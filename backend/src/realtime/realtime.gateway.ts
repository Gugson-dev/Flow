import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL,
  },
})
export class RealtimeGateway {
  @WebSocketServer()
  server!: Server;

  emitTasksUpdated() {
    this.server.emit('tasksUpdated');
  }

  emitProjectsUpdated() {
    this.server.emit('projectsUpdated');
  }
}