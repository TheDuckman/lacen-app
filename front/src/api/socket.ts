import { io, Socket } from 'socket.io-client';

let socket: Socket;

if (import.meta.env.VITE_NODE_ENV === 'development') {
  socket = io(import.meta.env.VITE_SERVER_URL);
} else {
  socket = io(import.meta.env.VITE_SERVER_URL, {
    path: import.meta.env.VUE_APP_SOCKET_POSTFIX,
  });
}

export default socket;
