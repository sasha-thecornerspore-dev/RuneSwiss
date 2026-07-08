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
          The AI provider and API key are managed in the desktop app (keys are encrypted on disk via
          the OS keychain). This web preview runs the offline panels only.
        </p>
      </div>
    )
  }

  const modelPlaceholder =
    s.provider === 'openai'
      ? 'e.g. llama3.1 or gpt-4o-mini'
      : s.provider === 'claude-cli'
        ? 'claude-opus-4-8 (optional — Claude Code default if blank)'
        : 'claude-opus-4-8'

  return (
    <div className="panel" style={{ maxWidth: 640 }}>
      <h1>
        <span className="accent">ᛒ</span> Settings
      </h1>
      <p className="sub">The assistant backend. Keys are encrypted at rest and only sent to the provider you choose.</p>

      <label className="fld">Provider</label>
      <select
        value={s.provider}
        onChange={(e) => setS({ ...s, provider: e.target.value as RuneSwissSettings['provider'] })}
      >
        <option value="anthropic">Anthropic API (Claude, pay-per-token key)</option>
        <option value="claude-cli">Claude subscription (via Claude Code — no key)</option>
        <option value="openai">OpenAI-compatible (Ollama / local gateway / custom)</option>
      </select>

      <label className="fld" style={{ marginTop: 14 }}>Model</label>
      <input
        type="text"
        value={s.model}
        placeholder={modelPlaceholder}
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

      {s.provider === 'claude-cli' ? (
        <div className="card" style={{ marginTop: 16 }}>
          <span className="accent">No API key needed.</span>{' '}
          <span className="muted">
            RuneSwiss runs your local <code>claude</code> CLI, which is authenticated with your Claude
            Code login — i.e. your Claude Pro/Max subscription. Make sure Claude Code is installed and
            signed in (<code>claude</code> on your PATH). Note: in this mode the assistant answers from
            its own reasoning and can't call RuneSwiss's engine tools (that's the Anthropic-API mode).
          </span>
        </div>
      ) : (
        <>
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
        </>
      )}

      {flash && <div className="card" style={{ marginTop: 14, color: 'var(--accent)' }}>{flash}</div>}
    </div>
  )
}
