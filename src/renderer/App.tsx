import { useState } from 'react'
import { ReaderPanel } from './panels/ReaderPanel'
import { TranslatorPanel } from './panels/TranslatorPanel'
import { CipherLabPanel } from './panels/CipherLabPanel'
import { AnalysisPanel } from './panels/AnalysisPanel'
import { HistoryPanel } from './panels/HistoryPanel'

const PANELS = [
  { id: 'reader', label: 'Reader', glyph: 'ᛟ', Comp: ReaderPanel },
  { id: 'translate', label: 'Translate', glyph: 'ᚠ', Comp: TranslatorPanel },
  { id: 'cipher', label: 'Cipher', glyph: 'ᛉ', Comp: CipherLabPanel },
  { id: 'analysis', label: 'Analyse', glyph: 'ᛏ', Comp: AnalysisPanel },
  { id: 'history', label: 'History', glyph: 'ᚷ', Comp: HistoryPanel },
] as const

export function App() {
  const [active, setActive] = useState<string>('reader')
  const Active = PANELS.find((p) => p.id === active)?.Comp ?? ReaderPanel
  return (
    <div className="app">
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
    </div>
  )
}
