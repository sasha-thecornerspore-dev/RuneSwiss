import { useEffect, useState } from 'react'

// A tiny shared store so the AI chat can see what the user is doing: the active Reader page, the
// current Cipher Lab output, and the latest Analysis. Panels push into it; the chat reads it.
type Ctx = { page?: string; cipher?: string; analysis?: string }

let ctx: Ctx = {}
const subs = new Set<() => void>()

export function setWorkspace(patch: Partial<Ctx>): void {
  ctx = { ...ctx, ...patch }
  subs.forEach((f) => f())
}

/** The full context string handed to the assistant's system prompt. */
export function buildContextString(): string {
  return [ctx.page, ctx.cipher, ctx.analysis].filter(Boolean).join('\n')
}

/** A short label of what context is attached, for a UI hint. */
export function contextSummary(): string {
  return [ctx.page && 'page', ctx.cipher && 'cipher', ctx.analysis && 'analysis']
    .filter(Boolean)
    .join(' + ')
}

/** Re-render a component whenever the workspace context changes. */
export function useContextSummary(): string {
  const [, force] = useState(0)
  useEffect(() => {
    const f = () => force((n) => n + 1)
    subs.add(f)
    return () => {
      subs.delete(f)
    }
  }, [])
  return contextSummary()
}
