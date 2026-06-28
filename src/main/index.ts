import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron'
import { join } from 'node:path'
import { streamChat, type ChatConfig, type ChatMessage } from './llm'
import * as store from './store'

let mainWindow: BrowserWindow | null = null
const aborters = new Map<string, AbortController>()

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#07090a',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.once('ready-to-show', () => mainWindow?.show())

  // open external links in the system browser, not in-app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpc(): void {
  // Secrets — the key is never returned to the renderer, only its presence.
  ipcMain.handle('secrets:has', () => store.hasKey())
  ipcMain.handle('secrets:set', (_e, key: string) => {
    store.setKey(key)
    return true
  })

  ipcMain.handle('settings:get', () => store.getSettings())
  ipcMain.handle('settings:set', (_e, s: store.Settings) => store.setSettings(s))

  ipcMain.handle('notes:load', () => store.getNotes())
  ipcMain.handle('notes:save', (_e, n: store.Note[]) => store.setNotes(n))

  // Streaming chat: renderer sends ai:start; main streams ai:delta and ends with ai:done / ai:error.
  ipcMain.on(
    'ai:start',
    async (e, payload: { id: string; messages: ChatMessage[]; config: ChatConfig }) => {
      const { id, messages, config } = payload
      const ctrl = new AbortController()
      aborters.set(id, ctrl)
      try {
        const apiKey = store.getKey()
        if (config.provider === 'anthropic' && !apiKey) {
          throw new Error('No API key set. Add your Anthropic key in Settings.')
        }
        await streamChat(config, apiKey, messages, ctrl.signal, (text) => {
          if (!e.sender.isDestroyed()) e.sender.send('ai:delta', { id, text })
        })
        if (!e.sender.isDestroyed()) e.sender.send('ai:done', { id })
      } catch (err) {
        const aborted = ctrl.signal.aborted
        if (e.sender.isDestroyed()) return
        if (aborted) e.sender.send('ai:done', { id })
        else e.sender.send('ai:error', { id, message: err instanceof Error ? err.message : String(err) })
      } finally {
        aborters.delete(id)
      }
    },
  )

  ipcMain.on('ai:cancel', (_e, { id }: { id: string }) => {
    aborters.get(id)?.abort()
  })
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  registerIpc()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
