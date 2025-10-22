import { ipcRenderer, contextBridge } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  // You can expose other APTs you need here.
  // ...
});

contextBridge.exposeInMainWorld("api", {
  // getHistory: () => ipcRenderer.invoke("get-clipboard-history"),
  // copyToClipboard: (text) => ipcRenderer.invoke("copy-to-clipboard", text),
  // clearHistory: () => ipcRenderer.invoke("clear-history"),
  // onUpdate: (callback) => {
  //   ipcRenderer.on("clipboard-update", (event, history) => callback(history));
  // },
  getLast: () => ipcRenderer.invoke("get-last"),
  sendLast: () => ipcRenderer.invoke("send-last"),
});

contextBridge.exposeInMainWorld("db", {
  add: (value: string) => ipcRenderer.invoke("history:add", value),
  get: () => ipcRenderer.invoke("history:get"),
  remove: (id: string) => ipcRenderer.invoke("history:delete", id),
});
