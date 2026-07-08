// Pure JSON-RPC 2.0 dispatch for the RuneSwiss MCP server — no stdio, no side effects, so it can be
// unit-tested directly. `server.ts` wires this to stdin/stdout. It reuses the SAME tool registry the
// Anthropic-API provider uses (`TOOLS` + `runTool`), so both providers expose an identical toolset.
import { TOOLS, runTool } from '../main/tools'

// Advertised if the client doesn't pin one; we echo the client's requested version when present so
// both sides agree on a protocol they speak.
export const FALLBACK_PROTOCOL = '2025-06-18'
export const SERVER_INFO = { name: 'runeswiss', version: '0.2.0' }

export interface RpcMessage {
  jsonrpc?: string
  id?: string | number | null
  method?: string
  params?: Record<string, unknown>
}

// MCP wants `inputSchema` (camelCase); our shared registry stores it as `input_schema`.
export function toolList() {
  return TOOLS.map((t) => ({ name: t.name, description: t.description, inputSchema: t.input_schema }))
}

const ok = (id: RpcMessage['id'], result: unknown) => ({ jsonrpc: '2.0', id, result })
const fail = (id: RpcMessage['id'], code: number, message: string) => ({
  jsonrpc: '2.0',
  id,
  error: { code, message },
})

// Returns the response object to write, or null for notifications / anything needing no reply.
export function dispatch(msg: RpcMessage): object | null {
  const { id, method, params } = msg
  const isRequest = id !== undefined && id !== null

  switch (method) {
    case 'initialize':
      return ok(id, {
        protocolVersion: (params?.protocolVersion as string) || FALLBACK_PROTOCOL,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      })
    case 'notifications/initialized':
    case 'notifications/cancelled':
      return null // lifecycle notifications carry no id and need no reply
    case 'ping':
      return isRequest ? ok(id, {}) : null
    case 'tools/list':
      return ok(id, { tools: toolList() })
    case 'tools/call': {
      const name = String(params?.name ?? '')
      const args = (params?.arguments as Record<string, unknown>) ?? {}
      let text: string
      let isError = false
      // runTool never throws (it catches internally and returns an `error: …` string), but guard anyway.
      try {
        text = runTool(name, args)
        isError = text.startsWith('error:') || text.startsWith('unknown tool:')
      } catch (e) {
        text = `error: ${e instanceof Error ? e.message : String(e)}`
        isError = true
      }
      return ok(id, { content: [{ type: 'text', text }], isError })
    }
    default:
      return isRequest ? fail(id, -32601, `Method not found: ${method}`) : null
  }
}
