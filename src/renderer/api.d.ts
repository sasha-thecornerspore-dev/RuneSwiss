// Types for the preload-exposed `window.api`. It's optional: in the standalone web build it's
// undefined, and AI/settings/notes features degrade gracefully.
export {}

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

export interface RuneSwissSettings {
  provider: 'anthropic' | 'openai' | 'claude-cli'
  model: string
  baseUrl: string
  accent: string
}
export interface RuneSwissNote {
  id: string
  text: string
  createdAt: number
}

interface RuneSwissUpdates {
  onAvailable(cb: (version: string) => void): () => void
  onProgress(cb: (percent: number) => void): () => void
  onDownloaded(cb: (version: string) => void): () => void
  onError(cb: (message: string) => void): () => void
  install(): Promise<void>
  check(): Promise<{ ok: boolean; message?: string }>
}

interface RuneSwissApi {
  ai: { chat(messages: AiMessage[], config: AiConfig, handlers: AiHandlers): () => void }
  secrets: { has(): Promise<boolean>; set(key: string): Promise<boolean> }
  settings: { get(): Promise<RuneSwissSettings>; set(s: RuneSwissSettings): Promise<RuneSwissSettings> }
  notes: { load(): Promise<RuneSwissNote[]>; save(n: RuneSwissNote[]): Promise<RuneSwissNote[]> }
  updates: RuneSwissUpdates
}

declare global {
  interface Window {
    api?: RuneSwissApi
  }
}
