
import { io } from 'socket.io-client';

export const socket = io(window.location.origin, {
  path: '/socket.io',
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export function connectSocket(token: string) {
  socket.disconnect();

  socket.auth = {
    token,
  };

  socket.connect();
}

export function disconnectSocket() {
  socket.disconnect();
  socket.auth = {};
}
