import { useState } from 'react'
import {
  frequencies,
  indexOfCoincidence,
  kasiskiCandidates,
  friedmanKeyLength,
  runeCount,
} from '../../core'
import { CORPUS } from '../data/corpus'

const firstUnsolved = CORPUS.find((c) => c.status === 'unsolved') ?? CORPUS[0]

export function AnalysisPanel() {
  const [input, setInput] = useState(firstUnsolved?.cipherText ?? 'ᚠᚢᚦᚩᚱᚳ')

  const freq = frequencies(input)
  const maxP = Math.max(...freq.map((f) => f.proportion), 0.0001)
  const ioc = indexOfCoincidence(input)
  const fried = friedmanKeyLength(input)
  const kas = kasiskiCandidates(input).slice(0, 6)

  return (
    <div className="panel" style={{ maxWidth: 1000 }}>
      <h1>
        <span className="accent">ᛏ</span> Analysis
      </h1>
      <p className="sub">Frequency, Index of Coincidence, Kasiski and Friedman over the 29-rune alphabet.</p>

      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <label className="fld" style={{ marginBottom: 0 }}>
          Text under analysis
        </label>
        <select
          style={{ width: 260 }}
          onChange={(e) => {
            const c = CORPUS.find((x) => x.id === e.target.value)
            if (c) setInput(c.cipherText)
          }}
          defaultValue=""
        >
          <option value="" disabled>
            load a corpus section…
          </option>
          {CORPUS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} ({c.status})
            </option>
          ))}
        </select>
      </div>
      <textarea style={{ marginTop: 6, minHeight: 70 }} value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />

      <div className="row wrap" style={{ gap: 12, marginTop: 14 }}>
        <div className="card" style={{ minWidth: 120 }}>
          <div className="muted" style={{ fontSize: 11 }}>RUNES</div>
          <div style={{ fontSize: 22 }}>{runeCount(input)}</div>
        </div>
        <div className="card" style={{ minWidth: 120 }}>
          <div className="muted" style={{ fontSize: 11 }}>IoC</div>
          <div style={{ fontSize: 22, color: 'var(--amber)' }}>{ioc.toFixed(4)}</div>
        </div>
        <div className="card" style={{ minWidth: 120 }}>
          <div className="muted" style={{ fontSize: 11 }}>FRIEDMAN KEY-LEN</div>
          <div style={{ fontSize: 22 }}>{fried ? fried.toFixed(2) : '—'}</div>
        </div>
        <div className="card grow">
          <div className="muted" style={{ fontSize: 11 }}>KASISKI KEY-LENGTH CANDIDATES</div>
          <div style={{ fontSize: 15, marginTop: 4 }}>
            {kas.length ? (
              kas.map((c) => (
                <span key={c.keyLength} style={{ marginRight: 12 }}>
                  <span style={{ color: 'var(--accent)' }}>{c.keyLength}</span>
                  <span className="muted" style={{ fontSize: 11 }}> ·{c.score}</span>
                </span>
              ))
            ) : (
              <span className="muted">—</span>
            )}
          </div>
        </div>
      </div>

      <h2>Rune frequency</h2>
      <div className="freq">
        {freq.map((f) => (
          <Frag key={f.index} rune={f.rune} latin={f.latin} count={f.count} pct={f.proportion / maxP} />
        ))}
      </div>
    </div>
  )
}

function Frag({ rune, latin, count, pct }: { rune: string; latin: string; count: number; pct: number }) {
  return (
    <>
      <div className="rl" title={latin}>
        {rune}
      </div>
      <div className="bar">
        <div style={{ width: `${Math.max(pct * 100, count ? 2 : 0)}%` }} />
      </div>
      <div className="ct">{count}</div>
    </>
  )
}
