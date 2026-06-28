import { useState } from 'react'
import {
  bruteShift,
  bruteAffine,
  vigenereKeyLengthScores,
  solveVigenereColumns,
  hillClimbVigenere,
  type Stage,
} from '../../core'

type Row = { label: string; sub: string; score?: number; action: () => void }

export function Attacks({ input, onApply }: { input: string; onApply: (stages: Stage[]) => void }) {
  const [title, setTitle] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [busy, setBusy] = useState(false)

  const preview = (latin: string) => latin.slice(0, 72) || '—'

  function runShift() {
    setTitle('Brute-force shift — ranked by English fitness')
    setRows(
      bruteShift(input)
        .slice(0, 8)
        .map((r) => ({
          label: `shift ${r.params.n}`,
          sub: preview(r.latin),
          score: r.score,
          action: () => onApply([{ op: 'shift', params: { n: r.params.n } }]),
        })),
    )
  }

  function runAffine() {
    setBusy(true)
    setTimeout(() => {
      setTitle('Brute-force affine — ranked by English fitness')
      setRows(
        bruteAffine(input)
          .slice(0, 8)
          .map((r) => ({
            label: `affine a=${r.params.a} b=${r.params.b}`,
            sub: preview(r.latin),
            score: r.score,
            action: () => onApply([{ op: 'affine', params: { a: r.params.a, b: r.params.b, decrypt: true } }]),
          })),
      )
      setBusy(false)
    }, 10)
  }

  function runKeyLen() {
    setTitle('Vigenère key length — per-column Index of Coincidence')
    setRows(
      vigenereKeyLengthScores(input, 20)
        .slice(0, 8)
        .map((s) => ({
          label: `length ${s.keyLength}`,
          sub: `avg IoC ${s.ioc.toFixed(4)} — click to solve →`,
          action: () => solveAt(s.keyLength),
        })),
    )
  }

  function solveAt(keyLength: number) {
    setBusy(true)
    setTimeout(() => {
      const seed = solveVigenereColumns(input, keyLength)
      const sol = hillClimbVigenere(input, keyLength, 3000)
      const best = sol.score >= seed.score ? sol : seed
      setTitle(`Vigenère solve — key length ${keyLength}`)
      setRows([
        {
          label: `key "${best.keyLatin || best.keyRunes}"`,
          sub: preview(best.latin),
          score: best.score,
          action: () => onApply([{ op: 'vigenere', params: { key: best.keyRunes, mode: 'sub' } }]),
        },
      ])
      setBusy(false)
    }, 10)
  }

  function autoSolve() {
    setBusy(true)
    setTimeout(() => {
      const len = vigenereKeyLengthScores(input, 16)[0]?.keyLength ?? 1
      solveAt(len)
    }, 10)
  }

  return (
    <div className="card" style={{ marginTop: 6 }}>
      <div className="row wrap" style={{ gap: 8, alignItems: 'center' }}>
        <span className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Attacks
        </span>
        <button className="btn" onClick={runShift}>brute shift</button>
        <button className="btn" onClick={runAffine}>brute affine</button>
        <button className="btn" onClick={runKeyLen}>vigenère key-length</button>
        <button className="btn primary" onClick={autoSolve}>auto-solve vigenère</button>
        {busy && <span className="muted" style={{ fontSize: 11 }}>working…</span>}
      </div>

      {title && (
        <div style={{ marginTop: 10 }}>
          <div className="muted" style={{ fontSize: 11, marginBottom: 6 }}>{title}</div>
          {rows.map((r, i) => (
            <button
              key={i}
              className="btn ghost"
              onClick={r.action}
              style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 4, padding: '7px 10px' }}
            >
              <span style={{ color: 'var(--accent)' }}>{r.label}</span>
              {r.score !== undefined && (
                <span className="muted" style={{ fontSize: 10 }}> · {r.score.toFixed(1)}</span>
              )}
              <div className="latin" style={{ fontSize: 12, marginTop: 2, color: 'var(--fg-dim)' }}>{r.sub}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
