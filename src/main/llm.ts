// Pluggable LLM streaming. Anthropic uses the official SDK (default claude-opus-4-8, adaptive
// thinking, streaming). The OpenAI-compatible path (Ollama / local OpenClaw gateway / any custom
// endpoint) is an intentionally provider-neutral fetch against /chat/completions — kept separate
// from the Anthropic SDK, never mixed.
import Anthropic from '@anthropic-ai/sdk'
import { app } from 'electron'
import { spawn } from 'node:child_process'
import { writeFileSync, existsSync } from 'node:fs'
import { join, delimiter } from 'node:path'
import { TOOLS, runTool } from './tools'

export interface ChatConfig {
  provider: 'anthropic' | 'openai' | 'claude-cli'
  model?: string
  baseUrl?: string
  system?: string
}
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function streamChat(
  cfg: ChatConfig,
  apiKey: string,
  messages: ChatMessage[],
  signal: AbortSignal,
  onText: (delta: string) => void,
): Promise<void> {
  if (cfg.provider === 'anthropic') return streamAnthropic(cfg, apiKey, messages, signal, onText)
  if (cfg.provider === 'claude-cli') return streamClaudeCli(cfg, messages, signal, onText)
  return streamOpenAICompatible(cfg, apiKey, messages, signal, onText)
}

// Resolve the Claude Code executable. The native installer produces a real binary (claude.exe on
// Windows, `claude` on unix) which spawns without a shell — so paths with spaces pass safely. An npm
// global install leaves a .cmd/.bat shim on Windows, which can ONLY run through a shell.
function resolveClaudeExe(): { exe: string; isBatch: boolean } {
  const override = process.env.RUNESWISS_CLAUDE
  const names =
    process.platform === 'win32' ? ['claude.exe', 'claude.cmd', 'claude.bat', 'claude'] : ['claude']
  const candidates: string[] = override ? [override] : []
  for (const dir of (process.env.PATH || '').split(delimiter)) {
    if (!dir) continue
    for (const n of names) candidates.push(join(dir, n))
  }
  for (const c of candidates) {
    if (existsSync(c)) return { exe: c, isBatch: /\.(cmd|bat)$/i.test(c) }
  }
  // Not found on PATH — fall back to a bare name so spawn surfaces a clear ENOENT the UI can show.
  const fallback = override || (process.platform === 'win32' ? 'claude.exe' : 'claude')
  return { exe: fallback, isBatch: /\.(cmd|bat)$/i.test(fallback) }
}

// The bundled MCP server (out/mcp/server.cjs), rewritten to the asar-unpacked location when packaged
// (see `asarUnpack` in package.json). In dev there is no app.asar in the path, so replace is a no-op.
function mcpServerPath(): string {
  return join(__dirname, '../mcp/server.cjs').replace('app.asar', 'app.asar.unpacked')
}

// Write the per-run MCP config that hands the RuneSwiss engine server to `claude`. The server runs
// via Electron-as-Node (process.execPath + ELECTRON_RUN_AS_NODE) so no separate Node install is
// needed on the user's machine.
function writeMcpConfig(): string {
  const cfg = {
    mcpServers: {
      runeswiss: {
        type: 'stdio',
        command: process.execPath,
        args: [mcpServerPath()],
        env: { ELECTRON_RUN_AS_NODE: '1' },
      },
    },
  }
  const path = join(app.getPath('userData'), 'mcp-runeswiss.json')
  writeFileSync(path, JSON.stringify(cfg, null, 2), 'utf8')
  return path
}

// Uses the local Claude Code CLI (`claude -p`), authenticated with the user's Claude subscription
// (or whatever Claude Code is logged into) — no API key needed. Unlike a raw pipe, we hand `claude`
// the RuneSwiss engine as a local MCP server (`--mcp-config` + `--strict-mcp-config`) and pre-approve
// its tools (`--allowedTools mcp__runeswiss__*`), so `claude` runs its OWN agentic tool loop and the
// assistant can actually transliterate / run ciphers / brute-force — not just chat. We parse the
// stream-json event stream and surface only assistant text + a tool-activity hint, so the user never
// sees Claude Code's own session/hook chatter. System prompt + conversation go via stdin (no length
// or shell-escaping limits); the model name is sanitized to a safe token.
async function streamClaudeCli(
  cfg: ChatConfig,
  messages: ChatMessage[],
  signal: AbortSignal,
  onText: (delta: string) => void,
): Promise<void> {
  const model = (cfg.model || '').replace(/[^a-z0-9.\-]/gi, '')
  const mcpConfigPath = writeMcpConfig()
  const { exe, isBatch } = resolveClaudeExe()

  const args = [
    '-p',
    '--output-format',
    'stream-json',
    '--verbose', // required by claude when combining -p with stream-json
    '--strict-mcp-config', // ignore the user's other MCP servers; use only ours
    '--mcp-config',
    mcpConfigPath,
    '--allowedTools',
    'mcp__runeswiss__*', // pre-authorize our engine tools so they run without a permission prompt
  ]
  if (model) args.push('--model', model)

  const convo = messages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n')
  const prompt = `${cfg.system ? `${cfg.system}\n\n=== CONVERSATION SO FAR ===\n\n` : ''}${convo}\n\nAssistant:`

  // A .cmd/.bat shim must run through a shell; quote spaced args so cmd.exe keeps them intact. A
  // resolved .exe runs shell-free, which already passes spaced paths correctly.
  const useShell = isBatch
  const spawnArgs = useShell ? args.map((a) => (/\s/.test(a) ? `"${a}"` : a)) : args

  let sawText = false
  const flushLine = (line: string): void => {
    const t = line.trim()
    if (!t) return
    let evt: {
      type?: string
      result?: unknown
      message?: { content?: Array<{ type?: string; text?: string; name?: string }> }
    }
    try {
      evt = JSON.parse(t)
    } catch {
      return // not a JSON event line
    }
    if (evt.type === 'assistant' && evt.message?.content) {
      for (const block of evt.message.content) {
        if (block.type === 'text' && block.text) {
          sawText = true
          onText(block.text)
        } else if (block.type === 'tool_use' && String(block.name || '').startsWith('mcp__runeswiss__')) {
          // Surface only OUR engine tools; hide Claude Code's internal plumbing (e.g. ToolSearch).
          onText(`\n  ⟢ ${String(block.name).replace('mcp__runeswiss__', '')}…\n`)
        }
      }
    } else if (evt.type === 'result' && !sawText && typeof evt.result === 'string') {
      // Fallback: only if the model produced no streamed assistant text blocks.
      onText(evt.result)
    }
  }

  await new Promise<void>((resolve, reject) => {
    const child = spawn(exe, spawnArgs, { shell: useShell, signal, windowsHide: true })
    let err = ''
    let buf = ''
    child.stdout.on('data', (d: Buffer) => {
      buf += d.toString()
      let nl: number
      while ((nl = buf.indexOf('\n')) >= 0) {
        flushLine(buf.slice(0, nl))
        buf = buf.slice(nl + 1)
      }
    })
    child.stderr.on('data', (d: Buffer) => {
      err += d.toString()
    })
    child.on('error', (e) =>
      reject(new Error(`Couldn't run the Claude Code CLI (${e.message}). Is 'claude' installed and logged in?`)),
    )
    child.on('close', (code) => {
      if (buf.trim()) flushLine(buf)
      if (code === 0 || signal.aborted) resolve()
      else reject(new Error(`Claude Code exited with code ${code}. ${err.slice(0, 400)}`.trim()))
    })
    child.stdin.write(prompt)
    child.stdin.end()
  })
}

async function streamAnthropic(
  cfg: ChatConfig,
  apiKey: string,
  messages: ChatMessage[],
  signal: AbortSignal,
  onText: (delta: string) => void,
): Promise<void> {
  const client = new Anthropic({ apiKey })
  const convo: Anthropic.MessageParam[] = messages.map((m) => ({ role: m.role, content: m.content }))

  // Streaming tool loop: the assistant may call engine tools; we run them and feed results back
  // until it finishes (stop_reason !== 'tool_use'). Bounded so a confused model can't loop forever.
  for (let turn = 0; turn < 8; turn++) {
    if (signal.aborted) return
    const stream = client.messages.stream(
      {
        model: cfg.model || 'claude-opus-4-8',
        max_tokens: 8192,
        system: cfg.system,
        // Adaptive thinking is the current default for hard tasks on Opus 4.x; some installed SDK
        // type versions only type enabled/disabled, so cast — the body passes through verbatim.
        thinking: { type: 'adaptive' } as unknown as Anthropic.MessageStreamParams['thinking'],
        tools: TOOLS as unknown as Anthropic.Tool[],
        messages: convo,
      },
      { signal },
    )
    stream.on('text', (delta) => onText(delta))
    const msg = await stream.finalMessage()
    convo.push({ role: 'assistant', content: msg.content as unknown as Anthropic.ContentBlockParam[] })
    if (msg.stop_reason !== 'tool_use') return

    const results: Anthropic.ToolResultBlockParam[] = []
    for (const block of msg.content) {
      if (block.type === 'tool_use') {
        onText(`\n  ⟢ ${block.name}…\n`)
        results.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: runTool(block.name, block.input as Record<string, unknown>),
        })
      }
    }
    convo.push({ role: 'user', content: results })
  }
}

async function streamOpenAICompatible(
  cfg: ChatConfig,
  apiKey: string,
  messages: ChatMessage[],
  signal: AbortSignal,
  onText: (delta: string) => void,
): Promise<void> {
  const base = (cfg.baseUrl || '').replace(/\/+$/, '')
  if (!base) throw new Error('No base URL set for the OpenAI-compatible endpoint (see Settings).')
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    signal,
    headers: {
      'content-type': 'application/json',
      ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: cfg.model || 'gpt-4o-mini',
      stream: true,
      messages: [...(cfg.system ? [{ role: 'system', content: cfg.system }] : []), ...messages],
    }),
  })
  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${detail}`.trim())
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    let nl: number
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim()
      buf = buf.slice(nl + 1)
      if (!line.startsWith('data:')) continue
      const data = line.slice(5).trim()
      if (data === '[DONE]') return
      try {
        const json = JSON.parse(data)
        const delta = json.choices?.[0]?.delta?.content
        if (delta) onText(delta)
      } catch {
        /* ignore keep-alive / partial lines */
      }
    }
  }
}
