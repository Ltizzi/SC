import { useEffect, useState } from "react";

import "./App.css";

declare global {
  interface Window {
    api: { getLast: () => Promise<string>; sendLast: (data: string) => void };
  }
}

function App() {
  const [lastClip, setLastClip] = useState("");

  const sendLast = () => {
    window.api.sendLast(lastClip);
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

        <div className="flex flex-col justify-center text-center w-full bg-transparent">
          <h2 className="text-lg text-secondary  py-5">Share last clipboard</h2>
          <div className="flex flex-col justify-center gap-2 w-2/3 mx-auto">
            <p className="text-primary italic text-xs">{lastClip}</p>
            <button
              className="btn btn-success btn-outline"
              onClick={() => sendLast()}
            >
              Envíar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
