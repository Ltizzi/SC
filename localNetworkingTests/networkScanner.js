import os from "os";
import net from "net";

function getLocalIPv4() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const netinfo of nets[name]) {
      if (netinfo.family === "IPv4" && !netinfo.internal) {
        return netinfo.address;
      }
    }
  }
  return null;
}

function ipRange(baseIp) {
  const parts = baseIp.split(".");
  return Array.from(
    { length: 254 },
    (_, i) => `${parts[0]}.${parts[1]}.${parts[2]}.${i + 1}`
  );
}

function checkPort(ip, port, timeout = 300) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let ok = false;
    socket.setTimeout(timeout);
    socket.once("connect", () => {
      ok = true;
      socket.destroy();
      resolve({ ip, ok });
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve({ ip, ok: false });
    });
    socket.once("error", () => {
      socket.destroy();
      resolve({ ip, ok: false });
    });
    socket.connect(port, ip);
  });
}

(async () => {
  const localIp = getLocalIPv4();
  const ips = ipRange(localIp);
  const results = await Promise.all(ips.map((ip) => checkPort(ip, 3000)));
  console.log(results.filter((r) => r.ok));
})();
