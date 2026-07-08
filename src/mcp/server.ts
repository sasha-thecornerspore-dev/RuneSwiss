// RuneSwiss engine as a Model Context Protocol (MCP) stdio server.
//
// This is what lets "Claude subscription" mode (the local `claude -p` CLI) call the real cipher/
// analysis engine instead of only chatting: the Claude Code CLI spawns this process, discovers the
// tools via `tools/list`, and calls them via `tools/call` inside its own agentic loop.
//
// Transport is newline-delimited JSON-RPC 2.0 over stdin/stdout — hand-rolled and dependency-free so
// the packaged app stays lean (the engine is pure `src/core`, bundled in; nothing here touches
// Electron, so it runs fine as a bare Node process / Electron-as-Node). Protocol logic lives in the
// pure, unit-tested `dispatch`; this file only wires it to the streams.
import { dispatch, type RpcMessage } from './dispatch'

function write(msg: unknown): void {
  process.stdout.write(JSON.stringify(msg) + '\n')
}

let buffer = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (chunk: string) => {
  buffer += chunk
  let nl: number
  while ((nl = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, nl).trim()
    buffer = buffer.slice(nl + 1)
    if (!line) continue
    try {
      const response = dispatch(JSON.parse(line) as RpcMessage)
      if (response) write(response)
    } catch {
      // Ignore malformed lines rather than crash the server mid-session.
    }
  }
})
process.stdin.on('end', () => process.exit(0))
