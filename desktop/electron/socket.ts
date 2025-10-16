import http from "http";
import { Server } from "socket.io";

export const socketServer = http.createServer();
const io = new Server(socketServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado:", socket.id);

  socket.on("discover", () => {
    console.log("Discover recibido de:", socket.id);
    socket.emit("discover_response", {
      status: "ok",
      serverName: "Mi Servidor",
    });
  });

  socket.on("message", (data) => {
    console.log("Mensaje recibido:", data);
    socket.emit("message", `Echo: ${data}`);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

export function sendLast(data: string) {
  console.log("Enviando mensaje: " + data);
  io.emit("message", data);
}
