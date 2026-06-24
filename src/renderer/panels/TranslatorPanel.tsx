import { useState } from 'react'
import { runesToLatin, latinToRunes, gematriaSum, runeCount } from '../../core'

export function TranslatorPanel() {
  const [text, setText] = useState('ᚠᚢᚦᚩᚱᚳ')
  return (
    <div className="panel">
      <h1>
        <span className="accent">ᚠ</span> Translator
      </h1>
      <p className="sub">Two-way Elder Futhark ↔ Latin through the Gematria Primus.</p>

      <label className="fld">Input — paste runes or latin</label>
      <textarea value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />

      <div className="row wrap" style={{ marginTop: 16, gap: 16 }}>
        <div className="grow">
          <h2>As Latin</h2>
          <div className="mono-out latin">
            {runesToLatin(text) || <span className="muted">—</span>}
          </div>
        </div>
        <div className="grow">
          <h2>As Runes</h2>
          <div className="mono-out runes">
            {latinToRunes(text) || <span className="muted">—</span>}
          </div>
        </div>
      </div>

      <h2>Gematria</h2>
      <div className="card row" style={{ gap: 32 }}>
        <div>
          <div className="muted" style={{ fontSize: 11 }}>RUNE-VALUE SUM</div>
          <div style={{ fontSize: 24, color: 'var(--amber)' }}>{gematriaSum(text)}</div>
        </div>
        <div>
          <div className="muted" style={{ fontSize: 11 }}>RUNE COUNT</div>
          <div style={{ fontSize: 24 }}>{runeCount(text)}</div>
        </div>
      </div>
    </div>
  )
}
