import { useEffect, useState } from 'react'
import { runesToLatin } from '../../core'
import { CORPUS } from '../data/corpus'
import { setWorkspace } from '../state/workspace'

type View = 'runes' | 'latin' | 'plain'

export function ReaderPanel() {
  const [sel, setSel] = useState(CORPUS[0]?.id)
  const [view, setView] = useState<View>('runes')
  const s = CORPUS.find((x) => x.id === sel)

  useEffect(() => {
    if (!s) return
    const clip = (t: string) => t.replace(/\s+/g, ' ').slice(0, 240)
    setWorkspace({
      page: `Reader is on "${s.title}" (${s.status}; ${s.method}). Ciphertext: ${clip(s.cipherText)} | Transliteration: ${clip(runesToLatin(s.cipherText))}${s.plainLatin ? ` | Known plaintext: ${clip(s.plainLatin)}` : ''}`,
    })
  }, [s])

  if (!s) return <div className="panel">No corpus loaded.</div>

  return (
    <div className="reader">
      <div className="list">
        {CORPUS.map((c) => (
          <button key={c.id} className={c.id === sel ? 'active' : ''} onClick={() => setSel(c.id)}>
            <div className="t">{c.title}</div>
            <div className="m">
              {c.status} · {c.method}
            </div>
          </button>
        ))}
      </div>
      <div className="doc">
        <h1>{s.title}</h1>
        <p className="sub">
          <span className={'badge ' + s.status}>{s.status}</span> &nbsp; {s.method} · {s.pageCount}{' '}
          page(s)
        </p>
        <div className="row" style={{ gap: 8, marginBottom: 16 }}>
          <button className={'btn' + (view === 'runes' ? ' primary' : '')} onClick={() => setView('runes')}>
            Runes
          </button>
          <button className={'btn' + (view === 'latin' ? ' primary' : '')} onClick={() => setView('latin')}>
            Transliteration
          </button>
          {s.plainLatin && (
            <button className={'btn' + (view === 'plain' ? ' primary' : '')} onClick={() => setView('plain')}>
              Plaintext
            </button>
          )}
        </div>
        {view === 'runes' && (
          <div className="runes" style={{ whiteSpace: 'pre-wrap' }}>
            {s.cipherText}
          </div>
        )}
        {view === 'latin' && (
          <div className="latin" style={{ whiteSpace: 'pre-wrap' }}>
            {runesToLatin(s.cipherText)}
          </div>
        )}
        {view === 'plain' && (
          <div className="latin plain" style={{ whiteSpace: 'pre-wrap' }}>
            {s.plainLatin}
          </div>
        )}
      </div>
    </div>
  )
}
