import { useEffect, useState } from "react";
import "./App.css";

declare global {
  interface Window {
    api: { getLast: () => Promise<string> };
  }
}

function App() {
  const [lastClip, setLastClip] = useState("");

  useEffect(() => {
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
          <div className="flex flex-col justify-center gap-2 w-1/3 mx-auto">
            <h1 className="text-primary italic text-xs">{lastClip}</h1>
            <button className="btn btn-success">Envíar</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
