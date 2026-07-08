import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'

interface AiConfig {
  provider: 'anthropic' | 'openai' | 'claude-cli'
  model?: string
  baseUrl?: string
  system?: string
}
interface AiMessage {
  role: 'user' | 'assistant'
  content: string
}
interface AiHandlers {
  onDelta: (text: string) => void
  onDone: () => void
  onError: (message: string) => void
}

const api = {
  ai: {
    /** Start a streaming chat. Returns a cancel function. */
    chat(messages: AiMessage[], config: AiConfig, handlers: AiHandlers): () => void {
      const id = Math.random().toString(36).slice(2) + Date.now().toString(36)
      const onDelta = (_e: IpcRendererEvent, p: { id: string; text: string }) => {
        if (p.id === id) handlers.onDelta(p.text)
      }
      const onDone = (_e: IpcRendererEvent, p: { id: string }) => {
        if (p.id === id) {
          cleanup()
          handlers.onDone()
        }
      }
      const onError = (_e: IpcRendererEvent, p: { id: string; message: string }) => {
        if (p.id === id) {
          cleanup()
          handlers.onError(p.message)
        }
      }
      const cleanup = () => {
        ipcRenderer.off('ai:delta', onDelta)
        ipcRenderer.off('ai:done', onDone)
        ipcRenderer.off('ai:error', onError)
      }
      ipcRenderer.on('ai:delta', onDelta)
      ipcRenderer.on('ai:done', onDone)
      ipcRenderer.on('ai:error', onError)
      ipcRenderer.send('ai:start', { id, messages, config })
      return () => {
        ipcRenderer.send('ai:cancel', { id })
        cleanup()
      }
    },
  },
  secrets: {
    has: (): Promise<boolean> => ipcRenderer.invoke('secrets:has'),
    set: (key: string): Promise<boolean> => ipcRenderer.invoke('secrets:set', key),
  },
  settings: {
    get: (): Promise<unknown> => ipcRenderer.invoke('settings:get'),
    set: (s: unknown): Promise<unknown> => ipcRenderer.invoke('settings:set', s),
  },
  notes: {
    load: (): Promise<unknown[]> => ipcRenderer.invoke('notes:load'),
    save: (n: unknown[]): Promise<unknown[]> => ipcRenderer.invoke('notes:save', n),
  },
}

contextBridge.exposeInMainWorld('api', api)
