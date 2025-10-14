import { app, BrowserWindow, clipboard, ipcMain, Tray, Menu } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
//import { io } from "socket.io-client";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(async () => {
  createWindow();
  createTray();
});

function createTray() {
  const tray = new Tray("ico.jpeg");

  const menu = Menu.buildFromTemplate([
    { label: "Abrir", click: () => win?.show() },
    {
      label: "Enviar último",
      click: () => sendLastClipboard(),
    },
    { type: "separator" },
    { label: "Salir", click: () => app.quit() },
  ]);

  tray.setContextMenu(menu);
  return tray;
}

function sendLastClipboard() {}

let previousText = "";
let history: ClipboardItem[] = [] as ClipboardItem[];

interface ClipboardItem {
  text: string;
  time: number;
}

ipcMain.handle("get-last", () => {
  const current = clipboard.readText();
  if (current && current !== previousText) {
    previousText = current;
    history.unshift({ text: current, time: Date.now() });
    // Enviar a renderer si está abierto
    // win?.webContents.send("clipboard-changed", history);
  }
  return history && history[0] && history[0].text
    ? history[0].text
    : "Copy something";
});
