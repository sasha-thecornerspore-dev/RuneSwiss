// Pluggable LLM streaming. Anthropic uses the official SDK (default claude-opus-4-8, adaptive
// thinking, streaming). The OpenAI-compatible path (Ollama / local OpenClaw gateway / any custom
// endpoint) is an intentionally provider-neutral fetch against /chat/completions — kept separate
// from the Anthropic SDK, never mixed.
import Anthropic from '@anthropic-ai/sdk'

export interface ChatConfig {
  provider: 'anthropic' | 'openai'
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
  return streamOpenAICompatible(cfg, apiKey, messages, signal, onText)
}

async function streamAnthropic(
  cfg: ChatConfig,
  apiKey: string,
  messages: ChatMessage[],
  signal: AbortSignal,
  onText: (delta: string) => void,
): Promise<void> {
  const client = new Anthropic({ apiKey })
  const stream = client.messages.stream(
    {
      model: cfg.model || 'claude-opus-4-8',
      max_tokens: 8192,
      system: cfg.system,
      // Adaptive thinking is the current default for hard tasks on Opus 4.x; some installed SDK
      // type versions only type enabled/disabled, so cast — the request body passes through verbatim.
      thinking: { type: 'adaptive' } as unknown as Anthropic.MessageStreamParams['thinking'],
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    },
    { signal },
  )
  stream.on('text', (delta) => onText(delta))
  await stream.finalMessage()
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
