import { contextBridge, ipcRenderer } from 'electron'

export interface ElectronAPI {
  onActivateSnip: (cb: () => void) => void
  captureScreen: () => Promise<string>
  hideOverlay: () => void
  showResult: (text: string) => void
  onDisplayResult: (cb: (text: string) => void) => void
  queryGemini: (base64Image: string, language?: string) => Promise<string>
  setIgnoreMouseEvents: (ignore: boolean) => void
  onEscPressed: (cb: () => void) => void
  chatMessage: (message: string) => Promise<string>
  clearChat: () => Promise<void>

  getApiKey: () => Promise<string>
  setApiKey: (key: string) => Promise<void>
  deleteApiKey: () => Promise<void>
  hasApiKey: () => Promise<boolean>

  onAppShown: (cb: () => void) => void

  quitApp: () => Promise<void>
}

const api: ElectronAPI = {
  onActivateSnip: (cb) => ipcRenderer.on('activate-snip', () => cb()),
  captureScreen: () => ipcRenderer.invoke('capture-screen'),
  hideOverlay: () => ipcRenderer.send('hide-overlay'),
  showResult: (text) => ipcRenderer.send('show-result', text),
  onDisplayResult: (cb) => ipcRenderer.on('display-result', (_event, text: string) => cb(text)),
  queryGemini: (base64Image, language) => ipcRenderer.invoke('query-gemini', base64Image, language),
  setIgnoreMouseEvents: (ignore) => ipcRenderer.send('set-ignore-mouse', ignore),
  onEscPressed: (cb) => ipcRenderer.on('esc-pressed', () => cb()),
  chatMessage: (message) => ipcRenderer.invoke('chat-message', message),
  clearChat: () => ipcRenderer.invoke('clear-chat'),

  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  setApiKey: (key: string) => ipcRenderer.invoke('set-api-key', key),
  deleteApiKey: () => ipcRenderer.invoke('delete-api-key'),
  hasApiKey: () => ipcRenderer.invoke('has-api-key'),

  onAppShown: (cb: () => void) => ipcRenderer.on('app-shown', () => cb()),

  quitApp: () => ipcRenderer.invoke('quit-app')
}

contextBridge.exposeInMainWorld('electronAPI', api)
