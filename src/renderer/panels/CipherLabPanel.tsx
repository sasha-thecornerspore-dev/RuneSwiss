import { useState } from 'react'
import { runPipeline, runesToLatin, type Stage } from '../../core'
import { CORPUS } from '../data/corpus'

type UIStage = {
  op: string
  n?: number
  key?: string
  mode?: 'add' | 'sub'
  startN?: number
  a?: number
  b?: number
  primer?: string
  decrypt?: boolean
}

const OPS = ['atbash', 'shift', 'vigenere', 'prime', 'totient', 'affine', 'autokey']

function toStage(s: UIStage): Stage {
  const p: Record<string, unknown> = {}
  if (s.op === 'shift') p.n = s.n ?? 0
  if (s.op === 'vigenere') {
    p.key = s.key ?? ''
    p.mode = s.mode ?? 'sub'
    p.decrypt = !!s.decrypt
  }
  if (s.op === 'prime' || s.op === 'totient') {
    p.mode = s.mode ?? 'sub'
    p.startN = s.startN ?? 1
  }
  if (s.op === 'affine') {
    p.a = s.a ?? 1
    p.b = s.b ?? 0
    p.decrypt = !!s.decrypt
  }
  if (s.op === 'autokey') {
    p.primer = s.primer ?? ''
    p.decrypt = !!s.decrypt
  }
  return { op: s.op, params: p }
}

export function CipherLabPanel() {
  const [input, setInput] = useState(CORPUS[0]?.cipherText ?? 'ᚠᚢᚦᚩᚱᚳ')
  const [stages, setStages] = useState<UIStage[]>([{ op: 'atbash' }])

  let output = ''
  let error = ''
  try {
    output = runPipeline(input, stages.map(toStage)).output
  } catch (e) {
    error = (e as Error).message
  }

  const patch = (i: number, d: Partial<UIStage>) =>
    setStages((st) => st.map((s, k) => (k === i ? { ...s, ...d } : s)))

  return (
    <div className="panel" style={{ maxWidth: 1000 }}>
      <h1>
        <span className="accent">ᛉ</span> Cipher Lab
      </h1>
      <p className="sub">Chain transforms over the 29-rune alphabet and watch the output update live.</p>

      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <label className="fld" style={{ marginBottom: 0 }}>
          Input (runes)
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
      <textarea
        style={{ marginTop: 6 }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        spellCheck={false}
      />

      <h2>Pipeline</h2>
      {stages.map((s, i) => (
        <div className="card row wrap" key={i} style={{ alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <select style={{ width: 130 }} value={s.op} onChange={(e) => patch(i, { op: e.target.value })}>
            {OPS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>

          {s.op === 'shift' && (
            <input type="number" style={{ width: 90 }} placeholder="n" value={s.n ?? 0} onChange={(e) => patch(i, { n: +e.target.value })} />
          )}
          {s.op === 'vigenere' && (
            <input type="text" style={{ width: 180 }} placeholder="key (runes or latin)" value={s.key ?? ''} onChange={(e) => patch(i, { key: e.target.value })} />
          )}
          {s.op === 'affine' && (
            <>
              <input type="number" style={{ width: 70 }} placeholder="a" value={s.a ?? 1} onChange={(e) => patch(i, { a: +e.target.value })} />
              <input type="number" style={{ width: 70 }} placeholder="b" value={s.b ?? 0} onChange={(e) => patch(i, { b: +e.target.value })} />
            </>
          )}
          {s.op === 'autokey' && (
            <input type="text" style={{ width: 150 }} placeholder="primer" value={s.primer ?? ''} onChange={(e) => patch(i, { primer: e.target.value })} />
          )}
          {(s.op === 'prime' || s.op === 'totient') && (
            <input type="number" style={{ width: 90 }} placeholder="startN" value={s.startN ?? 1} onChange={(e) => patch(i, { startN: +e.target.value })} />
          )}
          {(s.op === 'vigenere' || s.op === 'prime' || s.op === 'totient') && (
            <select style={{ width: 90 }} value={s.mode ?? 'sub'} onChange={(e) => patch(i, { mode: e.target.value as 'add' | 'sub' })}>
              <option value="sub">sub</option>
              <option value="add">add</option>
            </select>
          )}
          {(s.op === 'vigenere' || s.op === 'affine' || s.op === 'autokey') && (
            <label className="muted" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="checkbox" style={{ width: 'auto' }} checked={!!s.decrypt} onChange={(e) => patch(i, { decrypt: e.target.checked })} />
              decrypt
            </label>
          )}

          <button className="btn ghost" style={{ marginLeft: 'auto' }} onClick={() => setStages((st) => st.filter((_, k) => k !== i))}>
            ✕
          </button>
        </div>
      ))}
      <button className="btn" onClick={() => setStages((st) => [...st, { op: 'shift', n: 1 }])}>
        + add stage
      </button>

      <h2>Output</h2>
      {error ? (
        <div className="mono-out" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      ) : (
        <>
          <div className="mono-out runes" style={{ whiteSpace: 'pre-wrap' }}>
            {output || <span className="muted">—</span>}
          </div>
          <h2>Transliteration</h2>
          <div className="mono-out latin" style={{ whiteSpace: 'pre-wrap' }}>
            {runesToLatin(output) || <span className="muted">—</span>}
          </div>
        </>
      )}
    </div>
  )
}
