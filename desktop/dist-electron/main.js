import { app, BrowserWindow, Tray, Menu, ipcMain, clipboard } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(async () => {
  createWindow();
  createTray();
});
function createTray() {
  const tray = new Tray(path.join(__dirname, "../src/assets/ico.jpeg"));
  const menu = Menu.buildFromTemplate([
    { label: "Abrir", click: () => win?.show() },
    {
      label: "Enviar último",
      click: () => sendLastClipboard()
    },
    { type: "separator" },
    { label: "Salir", click: () => app.quit() }
  ]);
  tray.setContextMenu(menu);
  return tray;
}
let previousText = "";
let history = [];
async function sendLastClipboard() {
  const last = JSON.stringify(lastClip);
  if (socket && socket.connected) {
    socket.emit("client-message", last);
  } else {
    console.warn("Socket not connected");
  }
}
ipcMain.handle("get-last", () => {
  const current = clipboard.readText();
  if (current && current !== previousText) {
    previousText = current;
    history.unshift({ text: current, time: Date.now() });
  }
  return history && history[0] && history[0].text ? history[0].text : "Copy something";
});
ipcMain.handle("send-last", async () => {
  await sendLastClipboard();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
