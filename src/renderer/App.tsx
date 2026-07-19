import { useEffect, useState } from 'react'
import { ReaderPanel } from './panels/ReaderPanel'
import { TranslatorPanel } from './panels/TranslatorPanel'
import { CipherLabPanel } from './panels/CipherLabPanel'
import { AnalysisPanel } from './panels/AnalysisPanel'
import { HistoryPanel } from './panels/HistoryPanel'
import { NotesPanel } from './panels/NotesPanel'
import { SettingsPanel } from './panels/SettingsPanel'
import { StegoPanel } from './panels/StegoPanel'
import { MediaPanel } from './panels/MediaPanel'
import { ChatDock } from './ai/ChatDock'

const PANELS = [
  { id: 'reader', label: 'Reader', glyph: 'ᛟ', Comp: ReaderPanel },
  { id: 'translate', label: 'Translate', glyph: 'ᚠ', Comp: TranslatorPanel },
  { id: 'cipher', label: 'Cipher', glyph: 'ᛉ', Comp: CipherLabPanel },
  { id: 'analysis', label: 'Analyse', glyph: 'ᛏ', Comp: AnalysisPanel },
  { id: 'history', label: 'History', glyph: 'ᚷ', Comp: HistoryPanel },
  { id: 'media', label: 'Media', glyph: 'ᛈ', Comp: MediaPanel },
  { id: 'stego', label: 'Stego', glyph: 'ᛥ', Comp: StegoPanel },
  { id: 'notes', label: 'Notes', glyph: 'ᛗ', Comp: NotesPanel },
  { id: 'settings', label: 'Settings', glyph: 'ᛒ', Comp: SettingsPanel },
] as const

// Slim overlay bar driven by the main-process auto-updater. Silent while idle or on transient errors
// (offline / no release yet is normal); shows download progress, then a "Restart & update" action.
function UpdateBanner() {
  const api = typeof window !== 'undefined' ? window.api : undefined
  const [phase, setPhase] = useState<'idle' | 'downloading' | 'ready'>('idle')
  const [version, setVersion] = useState('')
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    if (!api) return
    const unsubs = [
      api.updates.onAvailable((v) => {
        setVersion(v)
        setPhase((p) => (p === 'ready' ? p : 'downloading'))
      }),
      api.updates.onProgress((pct) => {
        setPercent(pct)
        setPhase((p) => (p === 'ready' ? p : 'downloading'))
      }),
      api.updates.onDownloaded((v) => {
        setVersion(v)
        setPhase('ready')
      }),
    ]
    return () => unsubs.forEach((u) => u())
  }, [api])

  if (phase === 'idle') return null
  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '7px 14px',
        fontSize: 13,
        background: 'var(--accent, #34e0c4)',
        color: '#04120f',
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
      }}
    >
      {phase === 'downloading' ? (
        <span>Downloading update{version ? ` v${version}` : ''}… {percent}%</span>
      ) : (
        <>
          <span>
            <strong>RuneSwiss v{version}</strong> is ready to install.
          </span>
          <button
            onClick={() => api?.updates.install()}
            style={{
              cursor: 'pointer',
              border: 'none',
              borderRadius: 5,
              padding: '3px 12px',
              fontWeight: 600,
              background: '#04120f',
              color: 'var(--accent, #34e0c4)',
            }}
          >
            Restart &amp; update
          </button>
        </>
      )}
    </div>
  )
}

export function App() {
  const [active, setActive] = useState<string>('reader')
  const Active = PANELS.find((p) => p.id === active)?.Comp ?? ReaderPanel
  return (
    <div className="app">
      <UpdateBanner />
      <nav className="rail">
        <div className="brand" title="RuneSwiss">ᚱ</div>
        {PANELS.map((p) => (
          <button
            key={p.id}
            className={p.id === active ? 'active' : ''}
            onClick={() => setActive(p.id)}
          >
            <span className="glyph">{p.glyph}</span>
            <span className="lbl">{p.label}</span>
          </button>
        ))}
      </nav>
      <main className="workspace">
        <Active />
      </main>
      <ChatDock />
    </div>
  )
}
