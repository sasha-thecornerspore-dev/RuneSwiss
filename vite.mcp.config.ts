import { defineConfig } from 'vite'
import { builtinModules } from 'node:module'

// Builds the RuneSwiss MCP server (src/mcp/server.ts) into a single self-contained CommonJS file at
// out/mcp/server.cjs. The Claude Code CLI (subscription mode) spawns this with Electron-as-Node, so
// everything except Node built-ins is bundled in — no shared chunks, no node_modules lookups — which
// keeps packaging trivial (electron-builder just has to asarUnpack out/mcp/**).
const externals = [...builtinModules, ...builtinModules.map((m) => `node:${m}`)]

export default defineConfig({
  build: {
    outDir: 'out/mcp',
    emptyOutDir: true,
    minify: false,
    target: 'node18',
    lib: {
      entry: 'src/mcp/server.ts',
      formats: ['cjs'],
      fileName: () => 'server.cjs',
    },
    rollupOptions: {
      external: externals,
      output: { inlineDynamicImports: true },
    },
  },
})
