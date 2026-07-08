import { describe, it, expect } from 'vitest'
import { dispatch, toolList, SERVER_INFO } from './dispatch'

// The MCP JSON-RPC contract that Claude Code (subscription mode) depends on. These lock the protocol
// so a future refactor can't silently break "Claude subscription" tool use.
describe('MCP dispatch', () => {
  it('answers initialize by echoing the client protocol version and identifying the server', () => {
    const res = dispatch({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2025-06-18' },
    }) as { result: { protocolVersion: string; capabilities: unknown; serverInfo: unknown } }
    expect(res.result.protocolVersion).toBe('2025-06-18')
    expect(res.result.capabilities).toEqual({ tools: {} })
    expect(res.result.serverInfo).toEqual(SERVER_INFO)
  })

  it('lists every engine tool with an MCP-shaped (camelCase) inputSchema', () => {
    const res = dispatch({ jsonrpc: '2.0', id: 2, method: 'tools/list' }) as {
      result: { tools: Array<{ name: string; inputSchema: unknown }> }
    }
    const names = res.result.tools.map((t) => t.name)
    expect(names).toContain('transliterate')
    expect(names).toContain('run_cipher')
    expect(names).toContain('vigenere_solve')
    expect(res.result.tools).toHaveLength(toolList().length)
    // MCP requires `inputSchema`, not the SDK's `input_schema`.
    for (const t of res.result.tools) {
      expect(t.inputSchema).toBeDefined()
      expect((t as Record<string, unknown>).input_schema).toBeUndefined()
    }
  })

  it('runs a tool and returns its result as text content', () => {
    const res = dispatch({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: { name: 'transliterate', arguments: { text: 'ᚱᚢᚾᛖ' } },
    }) as { result: { content: Array<{ type: string; text: string }>; isError: boolean } }
    expect(res.result.content[0]).toEqual({ type: 'text', text: 'RUNE' })
    expect(res.result.isError).toBe(false)
  })

  it('flags a bad tool call as an error instead of throwing', () => {
    const res = dispatch({
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: { name: 'does_not_exist', arguments: {} },
    }) as { result: { isError: boolean } }
    expect(res.result.isError).toBe(true)
  })

  it('returns no reply for lifecycle notifications', () => {
    expect(dispatch({ jsonrpc: '2.0', method: 'notifications/initialized' })).toBeNull()
  })

  it('returns a JSON-RPC error for an unknown request method', () => {
    const res = dispatch({ jsonrpc: '2.0', id: 5, method: 'no/such/method' }) as {
      error: { code: number }
    }
    expect(res.error.code).toBe(-32601)
  })
})
