import { useState } from 'react'
import { PAGE_IMAGES, AUDIO, OPENING_IMAGES, PGP_MESSAGES, pgpUrl } from '../data/media'

export function MediaPanel() {
  const [bigImg, setBigImg] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ label: string; text: string } | null>(null)
  const [loadingMsg, setLoadingMsg] = useState('')

  async function openMsg(file: string, label: string) {
    setLoadingMsg(label)
    setMsg(null)
    try {
      const res = await fetch(pgpUrl(file))
      setMsg({ label, text: await res.text() })
    } catch (e) {
      setMsg({ label, text: `Couldn't load (offline?): ${(e as Error).message}` })
    } finally {
      setLoadingMsg('')
    }
  }

  return (
    <div className="panel" style={{ maxWidth: 1100 }}>
      <h1>
        <span className="accent">ᛈ</span> Media &amp; Artifacts
      </h1>
      <p className="sub">The original Cicada 3301 material, streamed from community archives. Needs an internet connection.</p>

      <h2>The opening images</h2>
      <div className="row wrap" style={{ gap: 14 }}>
        {OPENING_IMAGES.map((o) => (
          <figure key={o.year} style={{ margin: 0, width: 220 }}>
            <img
              src={o.url}
              loading="lazy"
              alt={`${o.year} opening`}
              onClick={() => setBigImg(o.url)}
              style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 8, cursor: 'zoom-in' }}
            />
            <figcaption className="muted" style={{ fontSize: 11, marginTop: 4 }}>
              <span className="accent">{o.year}</span> {o.caption}
            </figcaption>
          </figure>
        ))}
      </div>

      <h2>The Instar Emergence — audio</h2>
      <div className="card">
        <div style={{ marginBottom: 6 }}>
          {AUDIO.title} <span className="muted" style={{ fontSize: 11 }}>— {AUDIO.subtitle}</span>
        </div>
        <audio controls src={AUDIO.url} style={{ width: '100%' }} />
      </div>

      <h2>Liber Primus page scans ({PAGE_IMAGES.length})</h2>
      {bigImg && (
        <div onClick={() => setBigImg(null)} style={{ marginBottom: 10, cursor: 'zoom-out' }}>
          <img
            src={bigImg}
            alt="enlarged page"
            style={{ maxWidth: '100%', maxHeight: 540, border: '1px solid var(--accent-dim)', borderRadius: 8 }}
          />
          <div className="muted" style={{ fontSize: 10 }}>click to close</div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))', gap: 8 }}>
        {PAGE_IMAGES.map((p) => (
          <button key={p.page} className="btn ghost" style={{ padding: 4 }} onClick={() => setBigImg(p.url)} title={`Page ${p.page}`}>
            <img src={p.url} loading="lazy" alt={`page ${p.page}`} style={{ width: '100%', display: 'block', borderRadius: 4 }} />
            <div className="muted" style={{ fontSize: 9 }}>{p.page}</div>
          </button>
        ))}
      </div>

      <h2>Signed messages ({PGP_MESSAGES.length})</h2>
      <div className="row wrap" style={{ gap: 6 }}>
        {PGP_MESSAGES.map((m) => (
          <button
            key={m.file}
            className={'btn' + (msg?.label === m.label ? ' primary' : '')}
            onClick={() => void openMsg(m.file, m.label)}
          >
            {m.label}
          </button>
        ))}
      </div>
      {loadingMsg && <div className="muted" style={{ marginTop: 8 }}>loading {loadingMsg}…</div>}
      {msg && (
        <div style={{ marginTop: 10 }}>
          <div className="mono-out" style={{ whiteSpace: 'pre-wrap', maxHeight: 420, overflow: 'auto', fontSize: 11 }}>
            {msg.text}
          </div>
        </div>
      )}

      <p className="muted" style={{ fontSize: 10, marginTop: 18 }}>
        Page scans + audio: rtkd/iddqd · opening images: scream314/cicada3301 · messages: krisyotam/cicada3301.
        Community archives of the public Cicada 3301 puzzle.
      </p>
    </div>
  )
}
