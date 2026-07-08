// Pluggable LLM streaming. Anthropic uses the official SDK (default claude-opus-4-8, adaptive
// thinking, streaming). The OpenAI-compatible path (Ollama / local OpenClaw gateway / any custom
// endpoint) is an intentionally provider-neutral fetch against /chat/completions — kept separate
// from the Anthropic SDK, never mixed.
import Anthropic from '@anthropic-ai/sdk'
import { spawn } from 'node:child_process'
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

// Uses the local Claude Code CLI (`claude -p`), authenticated with the user's Claude subscription
// (or whatever Claude Code is logged into) — no API key needed. The conversation + system prompt are
// fed via stdin so nothing sensitive is shell-escaped; the model is sanitized to a safe token.
async function streamClaudeCli(
  cfg: ChatConfig,
  messages: ChatMessage[],
  signal: AbortSignal,
  onText: (delta: string) => void,
): Promise<void> {
  const model = (cfg.model || '').replace(/[^a-z0-9.\-]/gi, '')
  const args = ['-p']
  if (model) args.push('--model', model)
  const convo = messages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n')
  const prompt = `${cfg.system ? `${cfg.system}\n\n=== CONVERSATION SO FAR ===\n\n` : ''}${convo}\n\nAssistant:`

  await new Promise<void>((resolve, reject) => {
    const child = spawn('claude', args, { shell: true, signal })
    let err = ''
    child.stdout.on('data', (d: Buffer) => onText(d.toString()))
    child.stderr.on('data', (d: Buffer) => {
      err += d.toString()
    })
    child.on('error', (e) =>
      reject(new Error(`Couldn't run the Claude Code CLI (${e.message}). Is 'claude' installed and logged in?`)),
    )
    child.on('close', (code) => {
      if (code === 0 || signal.aborted) resolve()
      else reject(new Error(`Claude Code exited with code ${code}. ${err.slice(0, 400)}`))
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
