import { io, Socket } from 'socket.io-client';

let socket: Socket;

if (import.meta.env.VITE_NODE_ENV === 'development') {
  socket = io(import.meta.env.VITE_SERVER_URL);
} else {
  // Production: Node server uses path "/socket" (not the default "/socket.io")
  socket = io(import.meta.env.VITE_SERVER_URL, {
    path: import.meta.env.VITE_SOCKET_PATH,
  });
}

export default socket;
