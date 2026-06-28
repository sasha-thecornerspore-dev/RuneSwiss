import { useEffect, useState } from 'react'
import type { RuneSwissSettings } from '../api'

const DEFAULTS: RuneSwissSettings = {
  provider: 'anthropic',
  model: 'claude-opus-4-8',
  baseUrl: '',
  accent: '#34e0c4',
}

export function SettingsPanel() {
  const hasApi = typeof window !== 'undefined' && !!window.api
  const [s, setS] = useState<RuneSwissSettings>(DEFAULTS)
  const [hasKey, setHasKey] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [flash, setFlash] = useState('')

  useEffect(() => {
    if (!hasApi) return
    window.api!.settings.get().then((loaded) => setS({ ...DEFAULTS, ...loaded }))
    window.api!.secrets.has().then(setHasKey)
  }, [hasApi])

  function note(msg: string) {
    setFlash(msg)
    setTimeout(() => setFlash(''), 1600)
  }

  if (!hasApi) {
    return (
      <div className="panel">
        <h1>
          <span className="accent">ᛒ</span> Settings
        </h1>
        <p className="sub">
          The AI provider and API key are managed in the desktop app (the key is encrypted on disk
          via the OS keychain). This web preview runs the offline panels only.
        </p>
      </div>
    )
  }

  return (
    <div className="panel" style={{ maxWidth: 620 }}>
      <h1>
        <span className="accent">ᛒ</span> Settings
      </h1>
      <p className="sub">The assistant backend. Your key is encrypted at rest and never leaves this machine except in calls to the provider you choose.</p>

      <label className="fld">Provider</label>
      <select value={s.provider} onChange={(e) => setS({ ...s, provider: e.target.value as RuneSwissSettings['provider'] })}>
        <option value="anthropic">Anthropic (Claude)</option>
        <option value="openai">OpenAI-compatible (Ollama / local gateway / custom)</option>
      </select>

      <label className="fld" style={{ marginTop: 14 }}>Model</label>
      <input
        type="text"
        value={s.model}
        placeholder={s.provider === 'anthropic' ? 'claude-opus-4-8' : 'e.g. llama3.1 or gpt-4o-mini'}
        onChange={(e) => setS({ ...s, model: e.target.value })}
      />

      {s.provider === 'openai' && (
        <>
          <label className="fld" style={{ marginTop: 14 }}>Base URL</label>
          <input
            type="text"
            value={s.baseUrl}
            placeholder="http://127.0.0.1:11434/v1"
            onChange={(e) => setS({ ...s, baseUrl: e.target.value })}
          />
        </>
      )}

      <div style={{ marginTop: 14 }}>
        <button className="btn primary" onClick={async () => { await window.api!.settings.set(s); note('Settings saved.') }}>
          Save settings
        </button>
      </div>

      <h2>API key</h2>
      <p className="sub" style={{ marginTop: 0 }}>
        Status: {hasKey ? <span style={{ color: 'var(--solved)' }}>a key is stored</span> : <span className="muted">no key stored</span>}
      </p>
      <div className="row" style={{ gap: 8 }}>
        <input
          type="password"
          className="grow"
          value={keyInput}
          placeholder={s.provider === 'anthropic' ? 'sk-ant-…' : 'token (optional for local servers)'}
          onChange={(e) => setKeyInput(e.target.value)}
        />
        <button
          className="btn"
          onClick={async () => {
            await window.api!.secrets.set(keyInput)
            setKeyInput('')
            setHasKey(await window.api!.secrets.has())
            note('Key saved.')
          }}
        >
          Save key
        </button>
        {hasKey && (
          <button
            className="btn ghost"
            onClick={async () => {
              await window.api!.secrets.set('')
              setHasKey(await window.api!.secrets.has())
              note('Key cleared.')
            }}
          >
            Clear
          </button>
        )}
      </div>

      {flash && <div className="card" style={{ marginTop: 14, color: 'var(--accent)' }}>{flash}</div>}
    </div>
  )
}
