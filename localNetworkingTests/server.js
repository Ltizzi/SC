import http from "http";
import { app } from "./app.js";
import { setupSockets } from "./sockets.js";
import os from "os";

const server = http.createServer(app);

setupSockets(server);

// server.listen(3000, () => {
//   console.log("Listening on port 3000...");
//   console.log("Server IP:", server.address());
// });

server.listen(3000, "0.0.0.0", () => {
  console.log("Listening on port 3000...");

  // Mostrar todas las IPs disponibles

  const nets = os.networkInterfaces();
  console.log("IPs disponibles:");
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        console.log(`  ${name}: ${net.address}`);
      }
    }
  }
});
