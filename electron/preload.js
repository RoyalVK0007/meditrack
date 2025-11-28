const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Add any secure APIs here if needed in the future
  platform: process.platform,
  version: process.versions.electron
});