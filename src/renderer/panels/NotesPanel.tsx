import { useEffect, useState } from 'react'
import type { RuneSwissNote } from '../api'

const LS_KEY = 'runeswiss.notes'

async function loadNotes(): Promise<RuneSwissNote[]> {
  if (typeof window !== 'undefined' && window.api) return window.api.notes.load()
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}
async function persistNotes(notes: RuneSwissNote[]): Promise<void> {
  if (typeof window !== 'undefined' && window.api) await window.api.notes.save(notes)
  else localStorage.setItem(LS_KEY, JSON.stringify(notes))
}

export function NotesPanel() {
  const [notes, setNotes] = useState<RuneSwissNote[]>([])
  const [text, setText] = useState('')

  useEffect(() => {
    loadNotes().then(setNotes)
  }, [])

  async function add() {
    const t = text.trim()
    if (!t) return
    const next: RuneSwissNote[] = [
      { id: Math.random().toString(36).slice(2), text: t, createdAt: Date.now() },
      ...notes,
    ]
    setNotes(next)
    setText('')
    await persistNotes(next)
  }
  async function remove(id: string) {
    const next = notes.filter((n) => n.id !== id)
    setNotes(next)
    await persistNotes(next)
  }

  return (
    <div className="panel" style={{ maxWidth: 760 }}>
      <h1>
        <span className="accent">ᛗ</span> Notes &amp; Hypotheses
      </h1>
      <p className="sub">A running log of findings and ideas. Persisted on this machine.</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Record a hypothesis, a key candidate, an observed IoC…"
        spellCheck={false}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            void add()
          }
        }}
      />
      <div style={{ marginTop: 8 }}>
        <button className="btn primary" onClick={() => void add()} disabled={!text.trim()}>
          Add note <span className="muted" style={{ fontSize: 10 }}>⌘/Ctrl+↵</span>
        </button>
      </div>

      <h2>{notes.length} note(s)</h2>
      {notes.map((n) => (
        <div className="card" key={n.id} style={{ marginBottom: 8 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{n.text}</div>
            <button className="btn ghost" onClick={() => void remove(n.id)} title="Delete">
              ✕
            </button>
          </div>
          <div className="muted" style={{ fontSize: 10, marginTop: 6 }}>
            {new Date(n.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}
