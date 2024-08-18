import fs from "fs";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "@/app";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@/interface/socket.interface";

// Socket server
let httpServer;
let io;

const bs = function bootstrap() {
  const { NODE_ENV, PORT } = process.env;

  if (NODE_ENV !== "production") {
    // DEV
    httpServer = createServer(app);
    io = new Server<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(httpServer, {
      cors: {
        origin: process.env.BASE_URL_FRONT,
      },
    });
    io.on("connection", (socket) => {
      // eslint-disable-next-line no-console
      console.log(`[SOCKET] User connected. Socket id: ${socket.id}'`);
      socket.on("disconnect", () => {
        // eslint-disable-next-line no-console
        console.log("[SOCKET] User disconnected");
      });
      socket.on("close", () => {
        // eslint-disable-next-line no-console
        console.log("[SOCKET] Connection closed");
      });
    });
    httpServer.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`[EXPRESS] Server is running on port ${PORT}`);
    });
  } else {
    // PROD
    httpServer = createServer(
      {
        key: fs.readFileSync(`${__dirname}/localhost.key`),
        cert: fs.readFileSync(`${__dirname}/localhost.crt`),
      } as any,
      app,
    );
    io = new Server(httpServer, {
      path: "/socket",
      cors: {
        origin: process.env.BASE_URL_FRONT,
      },
    });
    io.on("connection", (socket) => {
      // eslint-disable-next-line no-console
      console.log(`[SOCKET] User connected. Socket id: ${socket.id}'`);

      socket.on("disconnect", () => {
        // eslint-disable-next-line no-console
        console.log("[SOCKET] User disconnected");
      });
      socket.on("close", () => {
        // eslint-disable-next-line no-console
        console.log("[SOCKET] Connection closed");
      });
    });
    httpServer.listen(PORT, () => {
      console.log(`[EXPRESS] Production server up and running. Port ${PORT}`);
    });
  }
};

bs();

export default io;
