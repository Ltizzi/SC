import { Server } from "socket.io";

export function setupSockets(server) {
  const io = new Server(server, {
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
}
