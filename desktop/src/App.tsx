import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./App.css";

declare global {
  interface Window {
    api: { getLast: () => Promise<string> };
  }
}

function App() {
  const [lastClip, setLastClip] = useState("");

  const sendLast = () => {
    if (socket && socket.connected) {
      socket.emit("client-message", lastClip);
    } else {
      console.warn("Socket not connected");
    }
  };

  let socket: Socket;

  const connectToServer = () => {
    console.log("asdasd");
    const ip = "192.168.0.109";
    const PORT = 3000;
    const TIMEOUT = 3000;

    const url = `http://${ip}:${PORT}`;

    socket = io(url, {
      timeout: TIMEOUT,
      reconnection: true,
      transports: ["websockets"],
      forceNew: true,
    });

    // const timeout = setTimeout(() => {
    //   socket.close();
    // }, TIMEOUT);

    socket.on("connect", () => {
      console.log("Conectando al servidor...");
      socket.emit("message", "Desktop app connected");
      //clearTimeout(timeout);
    });

    socket.on("server-message", (msg) => {
      console.log("Server: ", msg);
    });
    socket.on("disconnect", () => {
      console.log("Disconnected from server.");
    });
  };

  useEffect(() => {
    //  connectToServer();
    const interval = setInterval(async () => {
      const res = await window.api.getLast();
      if (res) setLastClip(res);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="w-screen h-screen bg-gradient-to-br from-base-100 to-base-300  flex flex-col justify-center gap-10 text-center">
        <h1 className="text-2xl text-primary">Shared Clipboard</h1>

        <button className="btn btn-success" onClick={() => connectToServer()}>
          Connect
        </button>
        <div className="flex flex-col justify-center text-center w-full bg-transparent">
          <h2 className="text-lg text-secondary  py-5">Share last clipboard</h2>
          <div className="flex flex-col justify-center gap-2 w-1/3 mx-auto">
            <h1 className="text-primary italic text-xs">{lastClip}</h1>
            <button className="btn btn-success" onClick={() => sendLast()}>
              Envíar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
