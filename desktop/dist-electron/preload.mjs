"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(
      channel,
      (event, ...args2) => listener(event, ...args2)
    );
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
electron.contextBridge.exposeInMainWorld("api", {
  // getHistory: () => ipcRenderer.invoke("get-clipboard-history"),
  // copyToClipboard: (text) => ipcRenderer.invoke("copy-to-clipboard", text),
  // clearHistory: () => ipcRenderer.invoke("clear-history"),
  // onUpdate: (callback) => {
  //   ipcRenderer.on("clipboard-update", (event, history) => callback(history));
  // },
  getLast: () => electron.ipcRenderer.invoke("get-last")
});
