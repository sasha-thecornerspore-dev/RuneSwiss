// Persistence for the desktop app: the API key (encrypted via safeStorage), settings, and notes.
// All files live in Electron's per-user data directory.
import { app, safeStorage } from 'electron'
import { join } from 'node:path'
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'

export interface Settings {
  provider: 'anthropic' | 'openai'
  model: string
  baseUrl: string
  accent: string
}

export interface Note {
  id: string
  text: string
  createdAt: number
}

const DEFAULT_SETTINGS: Settings = {
  provider: 'anthropic',
  model: 'claude-opus-4-8',
  baseUrl: '',
  accent: '#34e0c4',
}

const settingsPath = () => join(app.getPath('userData'), 'settings.json')
const notesPath = () => join(app.getPath('userData'), 'notes.json')
const secretPath = () => join(app.getPath('userData'), 'apikey.bin')

export function getSettings(): Settings {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(readFileSync(settingsPath(), 'utf8')) }
  } catch {
    return DEFAULT_SETTINGS
  }
}
export function setSettings(s: Settings): Settings {
  const merged = { ...DEFAULT_SETTINGS, ...s }
  writeFileSync(settingsPath(), JSON.stringify(merged, null, 2), 'utf8')
  return merged
}

export function getNotes(): Note[] {
  try {
    return JSON.parse(readFileSync(notesPath(), 'utf8'))
  } catch {
    return []
  }
}
export function setNotes(notes: Note[]): Note[] {
  writeFileSync(notesPath(), JSON.stringify(notes, null, 2), 'utf8')
  return notes
}

export function hasKey(): boolean {
  return existsSync(secretPath())
}
export function setKey(key: string): void {
  if (!key) {
    try {
      unlinkSync(secretPath())
    } catch {
      /* nothing to remove */
    }
    return
  }
  const buf = safeStorage.isEncryptionAvailable()
    ? safeStorage.encryptString(key)
    : Buffer.from(key, 'utf8')
  writeFileSync(secretPath(), buf)
}
export function getKey(): string {
  if (!existsSync(secretPath())) return ''
  const buf = readFileSync(secretPath())
  try {
    return safeStorage.isEncryptionAvailable() ? safeStorage.decryptString(buf) : buf.toString('utf8')
  } catch {
    return ''
  }
}
