import { useState } from 'react'
import { extractStrings, extractLsb } from '../../core'

export function StegoPanel() {
  const [name, setName] = useState('')
  const [info, setInfo] = useState('')
  const [strings, setStrings] = useState<string[]>([])
  const [lsb, setLsb] = useState<string[]>([])
  const [bits, setBits] = useState(1)
  const [isImage, setIsImage] = useState(false)

  async function handle(file: File) {
    setName(file.name)
    setStrings([])
    setLsb([])
    const buf = new Uint8Array(await file.arrayBuffer())
    setInfo(`${file.type || 'unknown type'} · ${buf.length.toLocaleString()} bytes`)
    setStrings(extractStrings(buf, 5).slice(0, 300))
    const img = file.type.startsWith('image/')
    setIsImage(img)
    if (!img) return
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(image, 0, 0)
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      const hidden = extractLsb(new Uint8Array(data.buffer), { bits, skipAlpha: true })
      setLsb(extractStrings(hidden, 5).slice(0, 300))
      URL.revokeObjectURL(url)
    }
    image.src = url
  }

  return (
    <div className="panel" style={{ maxWidth: 1000 }}>
      <h1>
        <span className="accent">ᛥ</span> Steganography
      </h1>
      <p className="sub">
        For the original Cicada image-puzzle stages. Drop a file to scan for embedded text and
        least-significant-bit data. (OutGuess — the JPEG tool Cicada used — needs the external binary
        and isn't reimplemented here.)
      </p>

      <label className="fld">File</label>
      <input
        type="file"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void handle(f)
        }}
      />
      {name && (
        <div className="card" style={{ marginTop: 10 }}>
          <span className="accent">{name}</span> <span className="muted">· {info}</span>
          {isImage && (
            <span className="muted" style={{ marginLeft: 12 }}>
              LSB bits:{' '}
              <select
                style={{ width: 60, display: 'inline-block' }}
                value={bits}
                onChange={(e) => setBits(Number(e.target.value))}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
              <span style={{ marginLeft: 6 }}>(re-pick a file to re-scan)</span>
            </span>
          )}
        </div>
      )}

      <div className="row wrap" style={{ gap: 16, marginTop: 14, alignItems: 'flex-start' }}>
        <div className="grow" style={{ minWidth: 320 }}>
          <h2>Printable strings ({strings.length})</h2>
          <div className="mono-out" style={{ maxHeight: 360, overflow: 'auto', fontSize: 12 }}>
            {strings.length ? strings.join('\n') : <span className="muted">—</span>}
          </div>
        </div>
        {isImage && (
          <div className="grow" style={{ minWidth: 320 }}>
            <h2>LSB-embedded strings ({lsb.length})</h2>
            <div className="mono-out" style={{ maxHeight: 360, overflow: 'auto', fontSize: 12 }}>
              {lsb.length ? lsb.join('\n') : <span className="muted">— nothing obvious</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
