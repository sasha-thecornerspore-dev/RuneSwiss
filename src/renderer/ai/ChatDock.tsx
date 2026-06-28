import { useEffect, useRef, useState } from 'react'
import { buildLiberPrimusSystemPrompt } from '../../core/ai/prompt'
import { buildContextString, useContextSummary } from '../state/workspace'

type Msg = { role: 'user' | 'assistant'; content: string }

export function ChatDock() {
  const [open, setOpen] = useState(true)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const cancelRef = useRef<null | (() => void)>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const hasApi = typeof window !== 'undefined' && !!window.api
  const sees = useContextSummary()

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [msgs])

  async function send() {
    const text = input.trim()
    if (!text || busy || !hasApi) return
    setError('')
    const convo: Msg[] = [...msgs, { role: 'user', content: text }]
    setMsgs([...convo, { role: 'assistant', content: '' }])
    setInput('')
    setBusy(true)
    const settings = await window.api!.settings.get().catch(() => null)
    const config = {
      provider: settings?.provider ?? 'anthropic',
      model: settings?.model,
      baseUrl: settings?.baseUrl,
      system: buildLiberPrimusSystemPrompt(buildContextString()),
    }
    cancelRef.current = window.api!.ai.chat(convo, config, {
      onDelta: (t) =>
        setMsgs((m) => {
          const c = [...m]
          c[c.length - 1] = { role: 'assistant', content: c[c.length - 1].content + t }
          return c
        }),
      onDone: () => {
        setBusy(false)
        cancelRef.current = null
      },
      onError: (msg) => {
        setError(msg)
        setBusy(false)
        cancelRef.current = null
        setMsgs((m) => m.slice(0, -1))
      },
    })
  }

  function stop() {
    cancelRef.current?.()
    setBusy(false)
    cancelRef.current = null
  }

  if (!open) {
    return (
      <button className="chat-fab" onClick={() => setOpen(true)} title="Open assistant">
        ✦
      </button>
    )
  }

  return (
    <aside className="chat">
      <div className="chat-head">
        <span>✦ Brainstorm</span>
        <button className="btn ghost" onClick={() => setOpen(false)} title="Collapse">
          ›
        </button>
      </div>
      <div className="chat-log" ref={logRef}>
        {msgs.length === 0 && (
          <div className="muted" style={{ padding: '8px 2px', fontSize: 12 }}>
            Ask about ciphers, key lengths, gematria, or the ᚠ-interrupt rule.
            {hasApi ? '' : ' (Available in the desktop app.)'}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={'msg ' + m.role}>
            <div className="who">{m.role === 'user' ? 'YOU' : 'RUNESWISS'}</div>
            <div className="body">
              {m.content || (busy && i === msgs.length - 1 ? '▸ thinking…' : '')}
            </div>
          </div>
        ))}
        {error && (
          <div className="msg err">
            <div className="body">{error}</div>
          </div>
        )}
      </div>
      {sees && (
        <div className="muted" style={{ fontSize: 10, padding: '0 12px 6px' }}>
          ✦ sees: {sees}
        </div>
      )}
      <div className="chat-in">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={hasApi ? 'Message the assistant…' : 'Run the desktop app to chat'}
          disabled={!hasApi}
          spellCheck={false}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void send()
            }
          }}
        />
        {busy ? (
          <button className="btn" onClick={stop}>
            Stop
          </button>
        ) : (
          <button className="btn primary" onClick={() => void send()} disabled={!hasApi || !input.trim()}>
            Send
          </button>
        )}
      </div>
    </aside>
  )
}
