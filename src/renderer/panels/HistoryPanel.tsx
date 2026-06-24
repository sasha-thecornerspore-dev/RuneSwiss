import { GEMATRIA } from '../../core'
import { CICADA_TIMELINE, CICADA_PGP_KEY_ID } from '../../core/corpus'

export function HistoryPanel() {
  return (
    <div className="panel" style={{ maxWidth: 1000 }}>
      <h1>
        <span className="accent">ᚷ</span> History &amp; Reference
      </h1>
      <p className="sub">
        The Cicada 3301 timeline and the Gematria Primus. Authentic messages are signed with OpenPGP key{' '}
        <span style={{ color: 'var(--amber)' }}>{CICADA_PGP_KEY_ID}</span>.
      </p>

      <div className="row wrap" style={{ gap: 32, alignItems: 'flex-start' }}>
        <div className="grow" style={{ minWidth: 320 }}>
          <h2>Timeline</h2>
          <div className="timeline">
            {CICADA_TIMELINE.map((e, i) => (
              <div className="ev" key={i}>
                <div className="d">{e.date}</div>
                <div className="h">{e.title}</div>
                <div className="x">{e.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ width: 360, flex: '0 0 360px' }}>
          <h2>Gematria Primus</h2>
          <table className="tbl">
            <thead>
              <tr>
                <th>Rune</th>
                <th>Latin</th>
                <th className="r">Prime</th>
                <th className="r">#</th>
              </tr>
            </thead>
            <tbody>
              {GEMATRIA.map((g) => (
                <tr key={g.index}>
                  <td className="runes" style={{ fontSize: 18, padding: '3px 8px' }}>
                    {g.rune}
                  </td>
                  <td>
                    {g.latin}
                    {g.alt.length ? <span className="muted"> /{g.alt.join('/')}</span> : null}
                  </td>
                  <td className="r" style={{ color: 'var(--amber)' }}>
                    {g.prime}
                  </td>
                  <td className="r muted">{g.index}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
