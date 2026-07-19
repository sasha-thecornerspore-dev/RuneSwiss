// Auto-update via electron-updater against the public GitHub Releases feed (see the `publish` block
// in package.json — it also emits the latest.yml manifest the updater reads). Only runs in the packaged
// app; dev has no update server. The NSIS install self-updates; the portable build can't and is skipped
// gracefully by electron-updater.
//
// Integrity is ALWAYS verified via the sha512 in latest.yml. We only disable the Authenticode publisher
// check (win.verifyUpdateCodeSignature=false) because the cert is self-signed — otherwise updates would
// fail on machines that don't trust the Corner Spore root CA. The sha512 hash check still guards the
// download against tampering.
import { app, ipcMain, type BrowserWindow } from 'electron'
import electronUpdater from 'electron-updater'

const { autoUpdater } = electronUpdater

export function initAutoUpdater(getWindow: () => BrowserWindow | null): void {
  if (!app.isPackaged) return // no update feed when running from source

  const send = (channel: string, payload?: unknown): void => {
    const win = getWindow()
    if (win && !win.webContents.isDestroyed()) win.webContents.send(channel, payload)
  }

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true // fallback: if the user never clicks "restart", install on quit

  autoUpdater.on('update-available', (info) => send('update:available', { version: info.version }))
  autoUpdater.on('download-progress', (p) => send('update:progress', { percent: Math.round(p.percent) }))
  autoUpdater.on('update-downloaded', (info) => send('update:downloaded', { version: info.version }))
  autoUpdater.on('error', (err) =>
    send('update:error', { message: err == null ? 'unknown error' : err.message || String(err) }),
  )

  // Renderer-triggered actions.
  ipcMain.handle('update:install', () => autoUpdater.quitAndInstall())
  ipcMain.handle('update:check', async () => {
    try {
      await autoUpdater.checkForUpdates()
      return { ok: true }
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : String(e) }
    }
  })

  // Check shortly after launch so startup isn't blocked; stay silent if offline / no release yet.
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(() => {
      /* offline or no published release — ignore */
    })
  }, 3000)
}
