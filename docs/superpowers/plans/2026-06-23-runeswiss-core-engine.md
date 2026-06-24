# RuneSwiss Plan 1 — Foundation & Core Cryptography Engine

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pure, UI-free, fully test-driven TypeScript library that performs Gematria Primus lookups, reversible rune↔Latin transliteration, all known Liber Primus ciphers, and statistical cryptanalysis — the independent "cryptography app" at the core of RuneSwiss.

**Architecture:** A single npm package scaffolded with `electron-vite` (React + TS) so later plans add the desktop shell without rework, but **this plan only builds and tests `src/core`** — code with zero Electron/DOM dependencies that runs identically in Node (vitest) and the browser (renderer). Every primitive is a pure function over the 29-rune alphabet (indices 0–28, mod 29). Correctness is proven by tests: round-trips, cipher invertibility, and known-answer vectors.

**Tech Stack:** TypeScript (strict), Vitest, electron-vite scaffold (Electron 33 + React 18, used by later plans), electron-builder (later plans). Node ≥ 20.

## Global Constraints

- Target directory: `C:\Users\sasha\Documents\Repos\RuneSwiss`.
- Package manager: `npm`. Node ≥ 20, Electron `^33.2.0` (matches existing Corner Spore apps).
- TypeScript `strict: true`. No `any` in `src/core` public signatures.
- `src/core` MUST NOT import `electron`, `react`, `fs`, or any DOM/Node-only API. Pure + isomorphic.
- Alphabet size is **29** (prime). All modular arithmetic is `mod 29`.
- TDD: write the failing test first, watch it fail, implement minimally, watch it pass, commit.
- Commit after every task with Conventional Commits (`feat:`, `test:`, `chore:`).
- Co-author every commit: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- No fabricated puzzle data in this plan — corpus content is Plan 2. Cipher tests here use
  synthetic vectors or the documented `DIVINITY` mechanism on short controlled inputs.

---

## File Structure

```
RuneSwiss/
├── package.json                 # deps + scripts (test, dev, build)
├── tsconfig.json                # strict TS
├── vitest.config.ts             # test runner
├── electron.vite.config.ts      # scaffold for later plans (not exercised here)
├── .gitignore
├── src/
│   ├── core/
│   │   ├── index.ts             # public barrel export
│   │   ├── gematria/
│   │   │   ├── table.ts         # the 29-rune GEMATRIA array + RuneEntry type
│   │   │   └── gematria.ts      # lookups, gematriaSum
│   │   ├── translit/
│   │   │   └── translit.ts      # runesToLatin, latinToRunes (longest-match)
│   │   ├── alphabet/
│   │   │   └── ops.ts           # index normalization, mod-29 helpers, toIndices/fromIndices
│   │   ├── ciphers/
│   │   │   ├── types.ts         # CipherResult, KeyStream types
│   │   │   ├── atbash.ts
│   │   │   ├── shift.ts
│   │   │   ├── vigenere.ts      # vigenère + running-key (add/subtract)
│   │   │   ├── totient.ts       # prime/totient-driven shift
│   │   │   ├── affine.ts        # affine + autokey
│   │   │   └── pipeline.ts      # compose stages
│   │   ├── math/
│   │   │   └── primes.ts        # isPrime, nthPrime, primeFactors, totient
│   │   └── analysis/
│   │       ├── frequency.ts
│   │       ├── ioc.ts
│   │       ├── kasiski.ts       # repeated-ngram spacing + friedman estimate
│   │       └── ngram.ts         # search
│   └── (main/ preload/ renderer/ stubs created in Task 1, fleshed out in Plan 3)
└── tests/  → colocated as *.test.ts beside each module (vitest default)
```

---

### Task 1: Project scaffold & tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `vitest.config.ts`, `electron.vite.config.ts`, `.gitignore`
- Create: `src/core/smoke.test.ts`
- Create stubs: `src/main/index.ts`, `src/preload/index.ts`, `src/renderer/index.html`, `src/renderer/main.tsx`

**Interfaces:**
- Produces: a working `npm test` (Vitest) and an installable dependency tree. No engine code yet.

- [ ] **Step 1: Initialize git and Node project**

```bash
cd "C:/Users/sasha/Documents/Repos/RuneSwiss"
git init
npm init -y
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "runeswiss",
  "version": "0.1.0",
  "description": "Liber Primus cryptanalysis workbench — Gematria Primus, ciphers, analysis, AI brainstorming.",
  "author": "Jeff Schatz",
  "license": "MIT",
  "private": true,
  "main": "out/main/index.js",
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "dist": "electron-vite build && electron-builder"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "electron": "^33.2.0",
    "electron-builder": "^24.13.3",
    "electron-vite": "^2.3.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "resolveJsonModule": true,
    "types": ["node", "vitest/globals"]
  },
  "include": ["src", "*.config.ts"]
}
```

- [ ] **Step 4: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: { globals: true, include: ['src/**/*.test.ts'] },
})
```

- [ ] **Step 5: Write minimal Electron scaffold stubs (not exercised in Plan 1)**

`electron.vite.config.ts`:
```ts
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: { build: { outDir: 'out/main' } },
  preload: { build: { outDir: 'out/preload' } },
  renderer: { plugins: [react()], build: { outDir: 'out/renderer' } },
})
```

`src/main/index.ts`:
```ts
// Electron main process — fleshed out in Plan 3 (Desktop App + AI).
export {}
```

`src/preload/index.ts`:
```ts
// Preload contextBridge — fleshed out in Plan 3.
export {}
```

`src/renderer/index.html`:
```html
<!doctype html>
<html><head><meta charset="utf-8" /><title>RuneSwiss</title></head>
<body><div id="root"></div><script type="module" src="./main.tsx"></script></body></html>
```

`src/renderer/main.tsx`:
```tsx
// Renderer entry — fleshed out in Plan 3.
export {}
```

- [ ] **Step 6: Write `.gitignore`**

```
node_modules/
out/
dist/
dist-desktop/
*.log
.DS_Store
```

- [ ] **Step 7: Write the smoke test `src/core/smoke.test.ts`**

```ts
import { describe, it, expect } from 'vitest'

describe('toolchain', () => {
  it('runs vitest', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 8: Install and run**

Run: `npm install && npm test`
Expected: install completes; Vitest prints `1 passed`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold RuneSwiss (electron-vite + React + TS + vitest)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Gematria Primus table

**Files:**
- Create: `src/core/gematria/table.ts`
- Test: `src/core/gematria/table.test.ts`

**Interfaces:**
- Produces:
  - `interface RuneEntry { index: number; rune: string; latin: string; alt: string[]; prime: number }`
  - `const GEMATRIA: readonly RuneEntry[]` — length 29, ordered by `index` 0..28.
  - `const ALPHABET_SIZE = 29`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { GEMATRIA, ALPHABET_SIZE, type RuneEntry } from './table'

const FIRST_29_PRIMES = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109,
]

describe('GEMATRIA table', () => {
  it('has 29 entries', () => {
    expect(ALPHABET_SIZE).toBe(29)
    expect(GEMATRIA).toHaveLength(29)
  })
  it('is ordered by index 0..28', () => {
    GEMATRIA.forEach((e: RuneEntry, i: number) => expect(e.index).toBe(i))
  })
  it('maps to the first 29 primes in order', () => {
    expect(GEMATRIA.map((e) => e.prime)).toEqual(FIRST_29_PRIMES)
  })
  it('has unique runes and unique canonical latin', () => {
    expect(new Set(GEMATRIA.map((e) => e.rune)).size).toBe(29)
    expect(new Set(GEMATRIA.map((e) => e.latin)).size).toBe(29)
  })
  it('spells F-U-TH-O-R-C at the start (futhorc order)', () => {
    expect(GEMATRIA.slice(0, 6).map((e) => e.latin)).toEqual(['F','U','TH','O','R','C'])
  })
  it('uses single Unicode runic codepoints', () => {
    GEMATRIA.forEach((e) => expect([...e.rune]).toHaveLength(1))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/gematria/table.test.ts`
Expected: FAIL — cannot find module `./table`.

- [ ] **Step 3: Write `src/core/gematria/table.ts`**

```ts
export interface RuneEntry {
  index: number
  rune: string
  latin: string
  alt: string[]
  prime: number
}

export const ALPHABET_SIZE = 29

// Gematria Primus: 29 Anglo-Saxon futhorc runes ↔ Latin ↔ first 29 primes.
// `latin` is the canonical transliteration; `alt` lists accepted alternates.
// Glyph/codepoint accuracy is additionally cross-checked in Plan 2 via
// solved-page round-trip tests.
export const GEMATRIA: readonly RuneEntry[] = [
  { index: 0,  rune: 'ᚠ', latin: 'F',  alt: [],        prime: 2 },
  { index: 1,  rune: 'ᚢ', latin: 'U',  alt: ['V'],     prime: 3 },
  { index: 2,  rune: 'ᚦ', latin: 'TH', alt: ['Þ'],     prime: 5 },
  { index: 3,  rune: 'ᚩ', latin: 'O',  alt: [],        prime: 7 },
  { index: 4,  rune: 'ᚱ', latin: 'R',  alt: [],        prime: 11 },
  { index: 5,  rune: 'ᚳ', latin: 'C',  alt: ['K'],     prime: 13 },
  { index: 6,  rune: 'ᚷ', latin: 'G',  alt: [],        prime: 17 },
  { index: 7,  rune: 'ᚹ', latin: 'W',  alt: [],        prime: 19 },
  { index: 8,  rune: 'ᚻ', latin: 'H',  alt: [],        prime: 23 },
  { index: 9,  rune: 'ᚾ', latin: 'N',  alt: [],        prime: 29 },
  { index: 10, rune: 'ᛁ', latin: 'I',  alt: [],        prime: 31 },
  { index: 11, rune: 'ᛄ', latin: 'J',  alt: [],        prime: 37 },
  { index: 12, rune: 'ᛇ', latin: 'EO', alt: [],        prime: 41 },
  { index: 13, rune: 'ᛈ', latin: 'P',  alt: [],        prime: 43 },
  { index: 14, rune: 'ᛉ', latin: 'X',  alt: [],        prime: 47 },
  { index: 15, rune: 'ᛋ', latin: 'S',  alt: ['Z'],     prime: 53 },
  { index: 16, rune: 'ᛏ', latin: 'T',  alt: [],        prime: 59 },
  { index: 17, rune: 'ᛒ', latin: 'B',  alt: [],        prime: 61 },
  { index: 18, rune: 'ᛖ', latin: 'E',  alt: [],        prime: 67 },
  { index: 19, rune: 'ᛗ', latin: 'M',  alt: [],        prime: 71 },
  { index: 20, rune: 'ᛚ', latin: 'L',  alt: [],        prime: 73 },
  { index: 21, rune: 'ᛝ', latin: 'NG', alt: ['ING'],   prime: 79 },
  { index: 22, rune: 'ᛟ', latin: 'OE', alt: [],        prime: 83 },
  { index: 23, rune: 'ᛞ', latin: 'D',  alt: [],        prime: 89 },
  { index: 24, rune: 'ᚪ', latin: 'A',  alt: [],        prime: 97 },
  { index: 25, rune: 'ᚫ', latin: 'AE', alt: ['Æ'],     prime: 101 },
  { index: 26, rune: 'ᚣ', latin: 'Y',  alt: [],        prime: 103 },
  { index: 27, rune: 'ᛡ', latin: 'IA', alt: ['IO'],    prime: 107 },
  { index: 28, rune: 'ᛠ', latin: 'EA', alt: [],        prime: 109 },
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/gematria/table.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/gematria/table.ts src/core/gematria/table.test.ts
git commit -m "feat(core): add Gematria Primus 29-rune table

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Gematria lookups & sums

**Files:**
- Create: `src/core/gematria/gematria.ts`
- Test: `src/core/gematria/gematria.test.ts`

**Interfaces:**
- Consumes: `GEMATRIA`, `RuneEntry` from `./table`.
- Produces:
  - `runeToEntry(rune: string): RuneEntry | undefined`
  - `latinToEntry(latin: string): RuneEntry | undefined`  (matches canonical or `alt`, case-insensitive)
  - `indexToEntry(i: number): RuneEntry | undefined`
  - `runeToValue(rune: string): number | undefined`
  - `gematriaSum(runes: string): number`  (sum of prime values of all recognized runes)

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { runeToEntry, latinToEntry, runeToValue, gematriaSum } from './gematria'

describe('gematria lookups', () => {
  it('looks up a rune', () => {
    expect(runeToEntry('ᚠ')?.latin).toBe('F')
    expect(runeToValue('ᚠ')).toBe(2)
    expect(runeToValue('ᛠ')).toBe(109)
  })
  it('looks up latin canonical and alternates, case-insensitively', () => {
    expect(latinToEntry('TH')?.prime).toBe(5)
    expect(latinToEntry('th')?.prime).toBe(5)
    expect(latinToEntry('K')?.latin).toBe('C')  // alt of C
    expect(latinToEntry('v')?.latin).toBe('U')  // alt of U
  })
  it('returns undefined for unknown', () => {
    expect(runeToEntry('Q')).toBeUndefined()
    expect(latinToEntry('Q')).toBeUndefined()
  })
  it('sums gematria values, ignoring non-runes', () => {
    expect(gematriaSum('ᚠᚢ')).toBe(5)        // 2 + 3
    expect(gematriaSum('ᚠ ᚢ.')).toBe(5)      // spaces/punct ignored
    expect(gematriaSum('')).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/gematria/gematria.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/core/gematria/gematria.ts`**

```ts
import { GEMATRIA, type RuneEntry } from './table'

const BY_RUNE = new Map<string, RuneEntry>(GEMATRIA.map((e) => [e.rune, e]))
const BY_LATIN = new Map<string, RuneEntry>()
for (const e of GEMATRIA) {
  BY_LATIN.set(e.latin.toUpperCase(), e)
  for (const a of e.alt) BY_LATIN.set(a.toUpperCase(), e)
}

export function runeToEntry(rune: string): RuneEntry | undefined {
  return BY_RUNE.get(rune)
}
export function latinToEntry(latin: string): RuneEntry | undefined {
  return BY_LATIN.get(latin.toUpperCase())
}
export function indexToEntry(i: number): RuneEntry | undefined {
  return GEMATRIA[i]
}
export function runeToValue(rune: string): number | undefined {
  return BY_RUNE.get(rune)?.prime
}
export function gematriaSum(runes: string): number {
  let sum = 0
  for (const ch of runes) sum += BY_RUNE.get(ch)?.prime ?? 0
  return sum
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/gematria/gematria.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/gematria/gematria.ts src/core/gematria/gematria.test.ts
git commit -m "feat(core): add gematria lookups and gematriaSum

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Transliteration rune→Latin

**Files:**
- Create: `src/core/translit/translit.ts` (rune→Latin half)
- Test: `src/core/translit/translit.test.ts`

**Interfaces:**
- Consumes: `runeToEntry` from `../gematria/gematria`.
- Produces:
  - `runesToLatin(text: string, opts?: { separator?: string }): string`
    Each rune → its canonical Latin. Runic separators `᛫` (U+16EB) and `᛬` (U+16EC) and `᚛`/`᚜`
    become a space / passthrough; unknown characters pass through unchanged.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { runesToLatin } from './translit'

describe('runesToLatin', () => {
  it('transliterates single and multi-char runes', () => {
    expect(runesToLatin('ᚠᚢᚦᚩᚱᚳ')).toBe('FUTHORC')
    expect(runesToLatin('ᛝᛟᛠ')).toBe('NGOEEA')
  })
  it('turns runic word separators into spaces', () => {
    expect(runesToLatin('ᚠᚢ᛫ᚦᚩ')).toBe('FU THO')
  })
  it('passes non-runes through', () => {
    expect(runesToLatin('ᚠ?')).toBe('F?')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/translit/translit.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/core/translit/translit.ts` (rune→Latin part)**

```ts
import { runeToEntry } from '../gematria/gematria'

const SEPARATORS = new Set(['᛫', '᛬'])     // runic word / section separators
const BRACKETS = new Set(['᚛', '᚜'])        // runic punctuation brackets (dropped)

export function runesToLatin(text: string): string {
  let out = ''
  for (const ch of text) {
    const entry = runeToEntry(ch)
    if (entry) out += entry.latin
    else if (SEPARATORS.has(ch)) out += ' '
    else if (BRACKETS.has(ch)) continue
    else out += ch
  }
  return out
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/translit/translit.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/translit/translit.ts src/core/translit/translit.test.ts
git commit -m "feat(core): add rune-to-latin transliteration

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Transliteration Latin→rune (longest-match)

**Files:**
- Modify: `src/core/translit/translit.ts` (add `latinToRunes`)
- Test: `src/core/translit/translit.test.ts` (add cases)

**Interfaces:**
- Consumes: `GEMATRIA` from `../gematria/table`.
- Produces:
  - `latinToRunes(text: string): string` — greedy longest-match tokenizer so multi-letter runes
    (`ING`, `TH`, `EO`, `OE`, `AE`, `EA`, `IA`, `IO`) map to one rune. Spaces → `᛫`. Case-insensitive.
- Guarantees: `runesToLatin(latinToRunes(x)) === x` for canonical uppercase rune-spellable `x`.

- [ ] **Step 1: Write the failing test (append to translit.test.ts)**

```ts
import { latinToRunes } from './translit'

describe('latinToRunes', () => {
  it('greedily matches multi-letter runes', () => {
    expect(latinToRunes('FUTHORC')).toBe('ᚠᚢᚦᚩᚱᚳ')
    expect(latinToRunes('THING')).toBe('ᚦᛝ')        // TH + ING, not T-H-I-N-G
    expect(latinToRunes('EOEA')).toBe('ᛇᛠ')         // EO + EA
  })
  it('maps spaces to the runic separator', () => {
    expect(latinToRunes('FU THO')).toBe('ᚠᚢ᛫ᚦᚩ')
  })
  it('round-trips canonical text', () => {
    const s = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾ'
    expect(latinToRunes(runesToLatin(s))).toBe(s)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/translit/translit.test.ts`
Expected: FAIL — `latinToRunes` not exported.

- [ ] **Step 3: Add `latinToRunes` to `src/core/translit/translit.ts`**

```ts
import { GEMATRIA } from '../gematria/table'

// All latin spellings (canonical + alt), longest first, so 'ING'/'TH' win over 'I'/'T'.
const LATIN_TOKENS: { latin: string; rune: string }[] = GEMATRIA
  .flatMap((e) => [e.latin, ...e.alt].map((l) => ({ latin: l.toUpperCase(), rune: e.rune })))
  .sort((a, b) => b.latin.length - a.latin.length)

export function latinToRunes(text: string): string {
  const s = text.toUpperCase()
  let out = ''
  let i = 0
  while (i < s.length) {
    if (s[i] === ' ') { out += '᛫'; i += 1; continue }
    const match = LATIN_TOKENS.find((t) => s.startsWith(t.latin, i))
    if (match) { out += match.rune; i += match.latin.length }
    else { out += s[i]; i += 1 }
  }
  return out
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/translit/translit.test.ts`
Expected: PASS (all rune↔latin cases).

- [ ] **Step 5: Commit**

```bash
git add src/core/translit/translit.ts src/core/translit/translit.test.ts
git commit -m "feat(core): add latin-to-rune longest-match transliteration

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Alphabet ops (mod-29 core for ciphers)

**Files:**
- Create: `src/core/alphabet/ops.ts`
- Test: `src/core/alphabet/ops.test.ts`

**Interfaces:**
- Consumes: `runeToEntry`, `indexToEntry` from gematria.
- Produces:
  - `mod(n: number, m?: number): number` — true modulo (handles negatives), default m=29.
  - `runesToIndices(text: string): (number | null)[]` — null for non-runes (preserved as holes).
  - `indicesToRunes(idx: (number | null)[], original: string): string` — rebuild, restoring non-runes from `original`.
  - `mapRuneIndices(text: string, fn: (i: number, pos: number) => number): string` — apply `fn` to each
    rune's index (counting only runes for `pos`), leave non-runes untouched. This is the substrate every cipher uses.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { mod, mapRuneIndices, runesToIndices } from './ops'

describe('alphabet ops', () => {
  it('computes true modulo', () => {
    expect(mod(-1)).toBe(28)
    expect(mod(30)).toBe(1)
    expect(mod(5, 7)).toBe(5)
  })
  it('maps rune indices and preserves non-runes & rune-position counter', () => {
    // shift every rune by +1; 'ᚠ'(0)->'ᚢ'(1), 'ᚢ'(1)->'ᚦ'(2); '.' untouched
    expect(mapRuneIndices('ᚠ.ᚢ', (i) => i + 1)).toBe('ᚢ.ᚦ')
  })
  it('passes rune position (runes only) to fn', () => {
    // add position: rune0 +0, rune1 +1 -> 'ᚠ'(0)->0='ᚠ', 'ᚠ'(0)+1=1='ᚢ'
    expect(mapRuneIndices('ᚠ ᚠ', (i, pos) => i + pos)).toBe('ᚠ ᚢ')
  })
  it('reports indices with null holes', () => {
    expect(runesToIndices('ᚠ?ᚢ')).toEqual([0, null, 1])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/alphabet/ops.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/core/alphabet/ops.ts`**

```ts
import { runeToEntry, indexToEntry } from '../gematria/gematria'
import { ALPHABET_SIZE } from '../gematria/table'

export function mod(n: number, m: number = ALPHABET_SIZE): number {
  return ((n % m) + m) % m
}

export function runesToIndices(text: string): (number | null)[] {
  return [...text].map((ch) => runeToEntry(ch)?.index ?? null)
}

export function mapRuneIndices(
  text: string,
  fn: (index: number, runePos: number) => number,
): string {
  let out = ''
  let pos = 0
  for (const ch of text) {
    const entry = runeToEntry(ch)
    if (entry) {
      out += indexToEntry(mod(fn(entry.index, pos)))!.rune
      pos += 1
    } else {
      out += ch
    }
  }
  return out
}

export function indicesToRunes(idx: (number | null)[], original: string): string {
  const chars = [...original]
  return idx.map((i, k) => (i === null ? chars[k] : indexToEntry(mod(i))!.rune)).join('')
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/alphabet/ops.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/alphabet/ops.ts src/core/alphabet/ops.test.ts
git commit -m "feat(core): add mod-29 alphabet ops substrate for ciphers

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Atbash & Shift ciphers

**Files:**
- Create: `src/core/ciphers/types.ts`, `src/core/ciphers/atbash.ts`, `src/core/ciphers/shift.ts`
- Test: `src/core/ciphers/atbash.test.ts`, `src/core/ciphers/shift.test.ts`

**Interfaces:**
- Consumes: `mapRuneIndices`, `mod` from `../alphabet/ops`; `ALPHABET_SIZE`.
- Produces:
  - `atbash(text: string): string` (self-inverse: reflect index `i → 28 - i`).
  - `shift(text: string, n: number): string`; `unshift(text, n) = shift(text, -n)`.

- [ ] **Step 1: Write the failing tests**

`src/core/ciphers/atbash.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { atbash } from './atbash'

describe('atbash', () => {
  it('reflects index i -> 28-i', () => {
    expect(atbash('ᚠ')).toBe('ᛠ')   // 0 -> 28
    expect(atbash('ᛠ')).toBe('ᚠ')   // 28 -> 0
  })
  it('is self-inverse', () => {
    const s = 'ᚠᚢᚦᚩᚱᚳᚷ'
    expect(atbash(atbash(s))).toBe(s)
  })
  it('preserves non-runes', () => {
    expect(atbash('ᚠ ᚠ')).toBe('ᛠ ᛠ')
  })
})
```

`src/core/ciphers/shift.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { shift, unshift } from './shift'

describe('shift', () => {
  it('shifts forward mod 29 and wraps', () => {
    expect(shift('ᚠ', 1)).toBe('ᚢ')      // 0 -> 1
    expect(shift('ᛠ', 1)).toBe('ᚠ')      // 28 -> 0 (wrap)
  })
  it('unshift inverts shift', () => {
    const s = 'ᚠᚢᚦᚩᚱ'
    expect(unshift(shift(s, 7), 7)).toBe(s)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/core/ciphers/atbash.test.ts src/core/ciphers/shift.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write the implementations**

`src/core/ciphers/types.ts`:
```ts
// A cipher transform takes runic text and returns runic text. Non-runes pass through.
export type RuneTransform = (text: string) => string
```

`src/core/ciphers/atbash.ts`:
```ts
import { mapRuneIndices } from '../alphabet/ops'
import { ALPHABET_SIZE } from '../gematria/table'

export function atbash(text: string): string {
  return mapRuneIndices(text, (i) => ALPHABET_SIZE - 1 - i)
}
```

`src/core/ciphers/shift.ts`:
```ts
import { mapRuneIndices } from '../alphabet/ops'

export function shift(text: string, n: number): string {
  return mapRuneIndices(text, (i) => i + n)
}
export function unshift(text: string, n: number): string {
  return shift(text, -n)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/core/ciphers/atbash.test.ts src/core/ciphers/shift.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/ciphers/types.ts src/core/ciphers/atbash.ts src/core/ciphers/shift.ts src/core/ciphers/atbash.test.ts src/core/ciphers/shift.test.ts
git commit -m "feat(core): add atbash and shift ciphers

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: Vigenère & running-key

**Files:**
- Create: `src/core/ciphers/vigenere.ts`
- Test: `src/core/ciphers/vigenere.test.ts`

**Interfaces:**
- Consumes: `mapRuneIndices`, `mod`; `latinToRunes`, `runesToIndices`; `GEMATRIA`.
- Produces:
  - `keyToIndices(key: string): number[]` — accepts runes OR latin (auto-detected); throws if empty/unmappable.
  - `vigenereEncrypt(text: string, key: string, mode?: 'add' | 'sub'): string`
  - `vigenereDecrypt(text: string, key: string, mode?: 'add' | 'sub'): string`
    The key stream repeats over **rune positions only**. `mode` selects add vs subtract (LP solves
    used subtraction); decrypt is the inverse op. Default `mode='sub'`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { vigenereEncrypt, vigenereDecrypt, keyToIndices } from './vigenere'

describe('vigenere', () => {
  it('accepts a latin key and maps to indices', () => {
    // DIVINITY -> D(89→idx23) I(31→10) V(U,3→1) I(10) N(29→9) I(10) T(59→16) Y(103→26)
    expect(keyToIndices('DIVINITY')).toEqual([23, 10, 1, 10, 9, 10, 16, 26])
  })
  it('decrypt inverts encrypt for add mode', () => {
    const pt = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾ'
    const ct = vigenereEncrypt(pt, 'ᚠᚢᚦ', 'add')
    expect(vigenereDecrypt(ct, 'ᚠᚢᚦ', 'add')).toBe(pt)
  })
  it('decrypt inverts encrypt for sub mode', () => {
    const pt = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾ'
    const ct = vigenereEncrypt(pt, 'DIVINITY', 'sub')
    expect(vigenereDecrypt(ct, 'DIVINITY', 'sub')).toBe(pt)
  })
  it('keys on rune positions, ignoring interleaved non-runes', () => {
    // key 'ᚢ'(+1) applied to every rune regardless of spaces
    expect(vigenereEncrypt('ᚠ ᚠ', 'ᚢ', 'add')).toBe('ᚢ ᚢ')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/ciphers/vigenere.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/core/ciphers/vigenere.ts`**

```ts
import { mapRuneIndices } from '../alphabet/ops'
import { runeToEntry } from '../gematria/gematria'
import { latinToRunes } from '../translit/translit'

export function keyToIndices(key: string): number[] {
  // If the key already contains runes, use them; otherwise treat as latin and convert.
  const hasRunes = [...key].some((ch) => runeToEntry(ch))
  const runes = hasRunes ? key : latinToRunes(key)
  const idx: number[] = []
  for (const ch of runes) {
    const e = runeToEntry(ch)
    if (e) idx.push(e.index)
  }
  if (idx.length === 0) throw new Error(`vigenere: key "${key}" has no usable runes`)
  return idx
}

export function vigenereEncrypt(text: string, key: string, mode: 'add' | 'sub' = 'sub'): string {
  const k = keyToIndices(key)
  const sign = mode === 'add' ? 1 : -1
  return mapRuneIndices(text, (i, pos) => i + sign * k[pos % k.length])
}

export function vigenereDecrypt(text: string, key: string, mode: 'add' | 'sub' = 'sub'): string {
  return vigenereEncrypt(text, key, mode === 'add' ? 'sub' : 'add')
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/ciphers/vigenere.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/ciphers/vigenere.ts src/core/ciphers/vigenere.test.ts
git commit -m "feat(core): add vigenere and running-key cipher

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 9: Prime & totient math utilities

**Files:**
- Create: `src/core/math/primes.ts`
- Test: `src/core/math/primes.test.ts`

**Interfaces:**
- Produces:
  - `isPrime(n: number): boolean`
  - `nthPrime(n: number): number` — 1-indexed (`nthPrime(1)===2`).
  - `primesUpTo(limit: number): number[]`
  - `primeFactors(n: number): number[]`
  - `totient(n: number): number` — Euler's φ.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { isPrime, nthPrime, primeFactors, totient } from './primes'

describe('prime utilities', () => {
  it('tests primality', () => {
    expect(isPrime(1)).toBe(false)
    expect(isPrime(2)).toBe(true)
    expect(isPrime(109)).toBe(true)
    expect(isPrime(111)).toBe(false)
  })
  it('returns the nth prime (1-indexed)', () => {
    expect(nthPrime(1)).toBe(2)
    expect(nthPrime(29)).toBe(109)
  })
  it('factors integers', () => {
    expect(primeFactors(360)).toEqual([2, 2, 2, 3, 3, 5])
  })
  it("computes Euler's totient", () => {
    expect(totient(1)).toBe(1)
    expect(totient(9)).toBe(6)
    expect(totient(109)).toBe(108) // prime
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/math/primes.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/core/math/primes.ts`**

```ts
export function isPrime(n: number): boolean {
  if (n < 2) return false
  if (n % 2 === 0) return n === 2
  for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false
  return true
}

export function primesUpTo(limit: number): number[] {
  const out: number[] = []
  for (let n = 2; n <= limit; n++) if (isPrime(n)) out.push(n)
  return out
}

export function nthPrime(n: number): number {
  if (n < 1) throw new Error('nthPrime is 1-indexed')
  let count = 0
  let candidate = 1
  while (count < n) {
    candidate++
    if (isPrime(candidate)) count++
  }
  return candidate
}

export function primeFactors(n: number): number[] {
  const out: number[] = []
  let m = Math.abs(n)
  for (let d = 2; d * d <= m; d++) while (m % d === 0) { out.push(d); m /= d }
  if (m > 1) out.push(m)
  return out
}

export function totient(n: number): number {
  if (n < 1) return 0
  let result = n
  let m = n
  for (let p = 2; p * p <= m; p++) {
    if (m % p === 0) {
      while (m % p === 0) m /= p
      result -= result / p
    }
  }
  if (m > 1) result -= result / m
  return Math.round(result)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/math/primes.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/math/primes.ts src/core/math/primes.test.ts
git commit -m "feat(core): add prime and Euler totient utilities

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 10: Totient/prime-stream cipher

**Files:**
- Create: `src/core/ciphers/totient.ts`
- Test: `src/core/ciphers/totient.test.ts`

**Interfaces:**
- Consumes: `mapRuneIndices`; `nthPrime`, `totient`.
- Produces:
  - `primeStreamShift(text, mode?: 'add'|'sub', startN?): string` — shift rune at position `pos`
    by `nthPrime(startN + pos)` (the LP "subtract the (p)th prime" family). Default mode `sub`, startN `1`.
  - `totientStreamShift(text, mode?, startN?): string` — shift by `totient(nthPrime(startN + pos))`.
  - Each has an inverse via the opposite mode.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { primeStreamShift, totientStreamShift } from './totient'

describe('prime/totient stream ciphers', () => {
  it('prime stream subtract inverts add', () => {
    const pt = 'ᚠᚢᚦᚩᚱᚳᚷ'
    const ct = primeStreamShift(pt, 'add')
    expect(primeStreamShift(ct, 'sub')).toBe(pt)
  })
  it('shifts first rune by the first prime (2) in add mode', () => {
    // 'ᚠ'(0) + nthPrime(1)=2 -> idx 2 = 'ᚦ'
    expect(primeStreamShift('ᚠ', 'add')).toBe('ᚦ')
  })
  it('totient stream subtract inverts add', () => {
    const pt = 'ᚠᚢᚦᚩᚱᚳᚷ'
    const ct = totientStreamShift(pt, 'add')
    expect(totientStreamShift(ct, 'sub')).toBe(pt)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/ciphers/totient.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/core/ciphers/totient.ts`**

```ts
import { mapRuneIndices } from '../alphabet/ops'
import { nthPrime, totient } from '../math/primes'

export function primeStreamShift(text: string, mode: 'add' | 'sub' = 'sub', startN = 1): string {
  const sign = mode === 'add' ? 1 : -1
  return mapRuneIndices(text, (i, pos) => i + sign * nthPrime(startN + pos))
}

export function totientStreamShift(text: string, mode: 'add' | 'sub' = 'sub', startN = 1): string {
  const sign = mode === 'add' ? 1 : -1
  return mapRuneIndices(text, (i, pos) => i + sign * totient(nthPrime(startN + pos)))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/ciphers/totient.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/ciphers/totient.ts src/core/ciphers/totient.test.ts
git commit -m "feat(core): add prime/totient stream ciphers

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 11: Affine & Autokey ciphers

**Files:**
- Create: `src/core/ciphers/affine.ts`
- Test: `src/core/ciphers/affine.test.ts`

**Interfaces:**
- Consumes: `mapRuneIndices`, `mod`; `ALPHABET_SIZE`.
- Produces:
  - `affineEncrypt(text, a, b): string` / `affineDecrypt(text, a, b): string` (`a` coprime to 29; throws otherwise).
  - `autokeyEncrypt(text, primer): string` / `autokeyDecrypt(text, primer): string` (key = primer then plaintext).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { affineEncrypt, affineDecrypt, autokeyEncrypt, autokeyDecrypt } from './affine'

describe('affine', () => {
  it('decrypt inverts encrypt', () => {
    const pt = 'ᚠᚢᚦᚩᚱᚳᚷ'
    expect(affineDecrypt(affineEncrypt(pt, 5, 8), 5, 8)).toBe(pt)
  })
  it('throws when a is not coprime to 29 (only multiples of 29 are non-coprime)', () => {
    expect(() => affineEncrypt('ᚠ', 29, 0)).toThrow()
  })
})

describe('autokey', () => {
  it('decrypt inverts encrypt', () => {
    const pt = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻ'
    expect(autokeyDecrypt(autokeyEncrypt(pt, 'ᚦ'), 'ᚦ')).toBe(pt)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/ciphers/affine.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/core/ciphers/affine.ts`**

```ts
import { mapRuneIndices, mod } from '../alphabet/ops'
import { ALPHABET_SIZE } from '../gematria/table'
import { runeToEntry, indexToEntry } from '../gematria/gematria'

function modInverse(a: number, m: number): number {
  const a0 = mod(a, m)
  for (let x = 1; x < m; x++) if (mod(a0 * x, m) === 1) return x
  throw new Error(`affine: a=${a} is not invertible mod ${m}`)
}

export function affineEncrypt(text: string, a: number, b: number): string {
  modInverse(a, ALPHABET_SIZE) // validates coprimality (throws if not)
  return mapRuneIndices(text, (i) => a * i + b)
}

export function affineDecrypt(text: string, a: number, b: number): string {
  const aInv = modInverse(a, ALPHABET_SIZE)
  return mapRuneIndices(text, (i) => aInv * (i - b))
}

export function autokeyEncrypt(text: string, primer: string): string {
  const keyIdx: number[] = []
  for (const ch of primer) { const e = runeToEntry(ch); if (e) keyIdx.push(e.index) }
  let pos = 0
  return mapRuneIndices(text, (i) => {
    const k = keyIdx[pos] ?? 0
    keyIdx.push(i) // plaintext feeds the key stream
    pos += 1
    return i + k
  })
}

export function autokeyDecrypt(text: string, primer: string): string {
  const keyIdx: number[] = []
  for (const ch of primer) { const e = runeToEntry(ch); if (e) keyIdx.push(e.index) }
  let pos = 0
  return mapRuneIndices(text, (c) => {
    const k = keyIdx[pos] ?? 0
    const p = mod(c - k)
    keyIdx.push(p) // recovered plaintext feeds the key stream
    pos += 1
    return p
  })
}
```

Note: `autokeyEncrypt` returns runes via `mapRuneIndices`, which mods the result; the `keyIdx.push(i)`
uses the raw plaintext index (0..28), keeping encrypt/decrypt symmetric. `indexToEntry` import is used
indirectly through `mapRuneIndices`; keep the import only if referenced, otherwise remove to satisfy
`noUnusedLocals`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/ciphers/affine.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/ciphers/affine.ts src/core/ciphers/affine.test.ts
git commit -m "feat(core): add affine and autokey ciphers

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 12: Transform pipeline

**Files:**
- Create: `src/core/ciphers/pipeline.ts`
- Test: `src/core/ciphers/pipeline.test.ts`

**Interfaces:**
- Consumes: all cipher fns; `RuneTransform` from `./types`.
- Produces:
  - `type Stage = { op: string; params?: Record<string, unknown> }`
  - `runPipeline(text: string, stages: Stage[]): { output: string; steps: { op: string; output: string }[] }`
    Applies stages left-to-right, capturing each intermediate output (for the Cipher Lab UI).
    Supported ops: `atbash`, `shift`, `vigenere`, `prime`, `totient`, `affine`, `autokey`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { runPipeline } from './pipeline'
import { atbash } from './atbash'
import { shift } from './shift'

describe('runPipeline', () => {
  it('applies stages left to right and records steps', () => {
    const text = 'ᚠᚢᚦᚩ'
    const { output, steps } = runPipeline(text, [
      { op: 'atbash' },
      { op: 'shift', params: { n: 3 } },
    ])
    expect(output).toBe(shift(atbash(text), 3))
    expect(steps.map((s) => s.op)).toEqual(['atbash', 'shift'])
    expect(steps[0].output).toBe(atbash(text))
  })
  it('throws on unknown op', () => {
    expect(() => runPipeline('ᚠ', [{ op: 'nope' }])).toThrow(/unknown op/i)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/ciphers/pipeline.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/core/ciphers/pipeline.ts`**

```ts
import { atbash } from './atbash'
import { shift } from './shift'
import { vigenereEncrypt, vigenereDecrypt } from './vigenere'
import { primeStreamShift, totientStreamShift } from './totient'
import { affineEncrypt, affineDecrypt } from './affine'
import { autokeyEncrypt, autokeyDecrypt } from './affine'

export type Stage = { op: string; params?: Record<string, unknown> }

function applyStage(text: string, stage: Stage): string {
  const p = stage.params ?? {}
  switch (stage.op) {
    case 'atbash': return atbash(text)
    case 'shift': return shift(text, Number(p.n ?? 0))
    case 'vigenere': {
      const key = String(p.key ?? '')
      const mode = (p.mode as 'add' | 'sub') ?? 'sub'
      return p.decrypt ? vigenereDecrypt(text, key, mode) : vigenereEncrypt(text, key, mode)
    }
    case 'prime': return primeStreamShift(text, (p.mode as 'add' | 'sub') ?? 'sub', Number(p.startN ?? 1))
    case 'totient': return totientStreamShift(text, (p.mode as 'add' | 'sub') ?? 'sub', Number(p.startN ?? 1))
    case 'affine': {
      const a = Number(p.a ?? 1), b = Number(p.b ?? 0)
      return p.decrypt ? affineDecrypt(text, a, b) : affineEncrypt(text, a, b)
    }
    case 'autokey': {
      const primer = String(p.primer ?? '')
      return p.decrypt ? autokeyDecrypt(text, primer) : autokeyEncrypt(text, primer)
    }
    default: throw new Error(`runPipeline: unknown op "${stage.op}"`)
  }
}

export function runPipeline(text: string, stages: Stage[]) {
  const steps: { op: string; output: string }[] = []
  let current = text
  for (const stage of stages) {
    current = applyStage(current, stage)
    steps.push({ op: stage.op, output: current })
  }
  return { output: current, steps }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/ciphers/pipeline.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/ciphers/pipeline.ts src/core/ciphers/pipeline.test.ts
git commit -m "feat(core): add composable cipher pipeline

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 13: Frequency analysis & Index of Coincidence

**Files:**
- Create: `src/core/analysis/frequency.ts`, `src/core/analysis/ioc.ts`
- Test: `src/core/analysis/frequency.test.ts`, `src/core/analysis/ioc.test.ts`

**Interfaces:**
- Consumes: `runeToEntry`, `GEMATRIA`, `ALPHABET_SIZE`.
- Produces:
  - `frequencies(text): { index: number; rune: string; latin: string; count: number; proportion: number }[]`
    (length 29, sorted by index; proportion over rune count only).
  - `runeCount(text): number`.
  - `indexOfCoincidence(text): number` — over the 29-rune alphabet.

- [ ] **Step 1: Write the failing tests**

`src/core/analysis/frequency.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { frequencies, runeCount } from './frequency'

describe('frequencies', () => {
  it('counts runes and ignores non-runes', () => {
    expect(runeCount('ᚠᚠᚢ x')).toBe(3)
    const f = frequencies('ᚠᚠᚢ')
    expect(f).toHaveLength(29)
    expect(f[0].count).toBe(2)               // ᚠ
    expect(f[1].count).toBe(1)               // ᚢ
    expect(f[0].proportion).toBeCloseTo(2 / 3)
  })
})
```

`src/core/analysis/ioc.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { indexOfCoincidence } from './ioc'

describe('indexOfCoincidence', () => {
  it('is 1.0 for a single repeated rune', () => {
    expect(indexOfCoincidence('ᚠᚠᚠᚠ')).toBeCloseTo(1)
  })
  it('is ~0 for an empty or one-rune text', () => {
    expect(indexOfCoincidence('ᚠ')).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/core/analysis/frequency.test.ts src/core/analysis/ioc.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write the implementations**

`src/core/analysis/frequency.ts`:
```ts
import { GEMATRIA } from '../gematria/table'
import { runeToEntry } from '../gematria/gematria'

export function runeCount(text: string): number {
  let n = 0
  for (const ch of text) if (runeToEntry(ch)) n++
  return n
}

export function frequencies(text: string) {
  const counts = new Array(GEMATRIA.length).fill(0)
  let total = 0
  for (const ch of text) {
    const e = runeToEntry(ch)
    if (e) { counts[e.index]++; total++ }
  }
  return GEMATRIA.map((e) => ({
    index: e.index, rune: e.rune, latin: e.latin,
    count: counts[e.index],
    proportion: total ? counts[e.index] / total : 0,
  }))
}
```

`src/core/analysis/ioc.ts`:
```ts
import { GEMATRIA } from '../gematria/table'
import { runeToEntry } from '../gematria/gematria'

export function indexOfCoincidence(text: string): number {
  const counts = new Array(GEMATRIA.length).fill(0)
  let n = 0
  for (const ch of text) { const e = runeToEntry(ch); if (e) { counts[e.index]++; n++ } }
  if (n < 2) return 0
  let sum = 0
  for (const c of counts) sum += c * (c - 1)
  return sum / (n * (n - 1))
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/core/analysis/frequency.test.ts src/core/analysis/ioc.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/analysis/frequency.ts src/core/analysis/ioc.ts src/core/analysis/frequency.test.ts src/core/analysis/ioc.test.ts
git commit -m "feat(core): add frequency analysis and index of coincidence

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 14: Kasiski, Friedman & n-gram search

**Files:**
- Create: `src/core/analysis/kasiski.ts`, `src/core/analysis/ngram.ts`
- Test: `src/core/analysis/kasiski.test.ts`, `src/core/analysis/ngram.test.ts`

**Interfaces:**
- Consumes: `runeToEntry`, `runesToIndices`, `indexOfCoincidence`.
- Produces:
  - `kasiskiCandidates(text, minGram?=3): { keyLength: number; score: number }[]` — repeated-n-gram
    spacing factors ranked by frequency; sorted by score desc.
  - `friedmanKeyLength(text): number` — classic estimate from IoC.
  - `findNgram(text, needle): number[]` — rune-position indices where `needle` (runes or latin) occurs.

- [ ] **Step 1: Write the failing tests**

`src/core/analysis/kasiski.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { kasiskiCandidates, friedmanKeyLength } from './kasiski'
import { vigenereEncrypt } from '../ciphers/vigenere'

describe('kasiski', () => {
  it('recovers a planted period as a top candidate', () => {
    // repetitive plaintext enciphered with a length-3 key tends to expose period 3
    const pt = 'ᚠᚢᚦᚩᚱᚳ'.repeat(6)
    const ct = vigenereEncrypt(pt, 'ᚠᚢᚦ', 'add')
    const top = kasiskiCandidates(ct).map((c) => c.keyLength)
    expect(top).toContain(3)
  })
})

describe('friedman', () => {
  it('returns a positive estimate', () => {
    const ct = vigenereEncrypt('ᚠᚢᚦᚩᚱᚳ'.repeat(20), 'ᚠᚢᚦᚩ', 'add')
    expect(friedmanKeyLength(ct)).toBeGreaterThan(0)
  })
})
```

`src/core/analysis/ngram.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { findNgram } from './ngram'

describe('findNgram', () => {
  it('finds rune positions of a runic needle', () => {
    expect(findNgram('ᚠᚢᚦᚠᚢ', 'ᚠᚢ')).toEqual([0, 3])
  })
  it('accepts a latin needle', () => {
    expect(findNgram('ᚠᚢᚦ', 'FU')).toEqual([0])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/core/analysis/kasiski.test.ts src/core/analysis/ngram.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write the implementations**

`src/core/analysis/ngram.ts`:
```ts
import { runeToEntry } from '../gematria/gematria'
import { latinToRunes } from '../translit/translit'

function onlyRunes(text: string): string {
  let out = ''
  for (const ch of text) if (runeToEntry(ch)) out += ch
  return out
}

export function findNgram(text: string, needle: string): number[] {
  const hay = onlyRunes(text)
  const hasRunes = [...needle].some((ch) => runeToEntry(ch))
  const pat = onlyRunes(hasRunes ? needle : latinToRunes(needle))
  if (!pat) return []
  const positions: number[] = []
  for (let i = 0; i + pat.length <= hay.length; i++) {
    if (hay.startsWith(pat, i)) positions.push(i)
  }
  return positions
}
```

`src/core/analysis/kasiski.ts`:
```ts
import { runeToEntry } from '../gematria/gematria'
import { indexOfCoincidence } from './ioc'
import { ALPHABET_SIZE } from '../gematria/table'

function onlyRunes(text: string): string {
  let out = ''
  for (const ch of text) if (runeToEntry(ch)) out += ch
  return out
}

function factorsOf(n: number): number[] {
  const f: number[] = []
  for (let d = 2; d <= n; d++) if (n % d === 0) f.push(d)
  return f
}

export function kasiskiCandidates(text: string, minGram = 3) {
  const s = onlyRunes(text)
  const seen = new Map<string, number[]>() // gram -> positions
  for (let i = 0; i + minGram <= s.length; i++) {
    const g = s.slice(i, i + minGram)
    const arr = seen.get(g) ?? []
    arr.push(i)
    seen.set(g, arr)
  }
  const factorScore = new Map<number, number>()
  for (const positions of seen.values()) {
    if (positions.length < 2) continue
    for (let k = 1; k < positions.length; k++) {
      const spacing = positions[k] - positions[0]
      for (const f of factorsOf(spacing)) {
        if (f < 2 || f > 40) continue
        factorScore.set(f, (factorScore.get(f) ?? 0) + 1)
      }
    }
  }
  return [...factorScore.entries()]
    .map(([keyLength, score]) => ({ keyLength, score }))
    .sort((a, b) => b.score - a.score)
}

export function friedmanKeyLength(text: string): number {
  const s = onlyRunes(text)
  const n = s.length
  const ic = indexOfCoincidence(s)
  const kappaR = 1 / ALPHABET_SIZE          // random IoC for 29-letter alphabet
  const kappaP = 0.0667                      // approx natural-language IoC
  const denom = (n - 1) * ic - kappaR * n + kappaP
  if (denom <= 0) return 0
  return (kappaP - kappaR) * n / denom
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/core/analysis/kasiski.test.ts src/core/analysis/ngram.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/analysis/kasiski.ts src/core/analysis/ngram.ts src/core/analysis/kasiski.test.ts src/core/analysis/ngram.test.ts
git commit -m "feat(core): add kasiski, friedman and n-gram search

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 15: Public API barrel & full-surface smoke test

**Files:**
- Create: `src/core/index.ts`
- Test: `src/core/index.test.ts`
- Modify: delete `src/core/smoke.test.ts` (superseded)

**Interfaces:**
- Produces: a single import surface `import { ... } from 'src/core'` re-exporting every public symbol.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import {
  GEMATRIA, runeToValue, gematriaSum,
  runesToLatin, latinToRunes,
  atbash, shift, vigenereEncrypt, vigenereDecrypt,
  primeStreamShift, affineEncrypt, affineDecrypt, runPipeline,
  isPrime, totient, frequencies, indexOfCoincidence, kasiskiCandidates, findNgram,
} from './index'

describe('core public API', () => {
  it('re-exports the full surface and round-trips a vigenere decrypt', () => {
    expect(GEMATRIA).toHaveLength(29)
    const pt = 'ᚠᚢᚦᚩᚱᚳ'
    const ct = vigenereEncrypt(pt, 'DIVINITY', 'sub')
    expect(vigenereDecrypt(ct, 'DIVINITY', 'sub')).toBe(pt)
    expect(typeof runeToValue('ᚠ')).toBe('number')
    expect(runesToLatin(latinToRunes('FUTHORC'))).toBe('FUTHORC')
    expect(isPrime(2)).toBe(true)
    // reference the rest so the barrel is exercised
    void [gematriaSum, atbash, shift, primeStreamShift, affineEncrypt, affineDecrypt,
      runPipeline, totient, frequencies, indexOfCoincidence, kasiskiCandidates, findNgram]
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/index.test.ts`
Expected: FAIL — `./index` not found.

- [ ] **Step 3: Write `src/core/index.ts`**

```ts
export * from './gematria/table'
export * from './gematria/gematria'
export * from './translit/translit'
export * from './alphabet/ops'
export * from './ciphers/types'
export * from './ciphers/atbash'
export * from './ciphers/shift'
export * from './ciphers/vigenere'
export * from './ciphers/totient'
export * from './ciphers/affine'
export * from './ciphers/pipeline'
export * from './math/primes'
export * from './analysis/frequency'
export * from './analysis/ioc'
export * from './analysis/kasiski'
export * from './analysis/ngram'
```

- [ ] **Step 4: Delete the superseded smoke test, run full suite + typecheck**

```bash
rm src/core/smoke.test.ts
npx tsc --noEmit
npm test
```
Expected: `tsc` clean; Vitest reports all suites passing.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(core): add public API barrel and full-surface smoke test

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review (run against the spec)

- **Spec coverage (§4 core engine):** Gematria table+lookups (Tasks 2–3) ✓; transliteration both ways
  incl. multi-char runes & separators (Tasks 4–5) ✓; Atbash/shift/Vigenère/running-key/totient-prime/
  affine/autokey/pipeline (Tasks 7–12) ✓; frequency/IoC/Kasiski/Friedman/n-gram/prime+totient utils
  (Tasks 9, 13–14) ✓; pure isomorphic + TDD throughout ✓. Solved-page regression tests are in **Plan 2**
  (they need corpus data) — flagged, not dropped.
- **Placeholder scan:** No TBD/TODO; every code step has real code and exact commands. ✓
- **Type consistency:** `RuneEntry`/`GEMATRIA` shape consistent across tasks; cipher fns share the
  `mapRuneIndices(index, runePos)` substrate; `mode: 'add'|'sub'` consistent across vigenere/totient/
  prime; pipeline op names match the implemented ciphers. ✓
- **Note on Task 11:** remove the `indexToEntry` import if unused to satisfy `noUnusedLocals`
  (called out inline in the task).

---

## Roadmap — subsequent plans (each its own full plan when reached)

- **Plan 2 — Corpus & Data.** Multi-source research workflow to fetch + cross-verify the full Liber
  Primus transcriptions, solved-page plaintexts (cipher+key), and the Cicada timeline; normalize to
  Unicode runes; bundle as validated JSON with per-page provenance/confidence; add the **solved-page
  regression tests** that prove the engine reproduces every documented solve; user-override loader.
- **Plan 3 — Desktop App & AI.** Flesh out the electron-vite main/preload/renderer; the cryptic-terminal
  UI shell + nav; the Reader, Translator, Cipher Lab, Analysis, History/Reference, Notes panels; the
  `LLMProvider` abstraction (Anthropic default `claude-opus-4-8` + OpenAI-compatible), `safeStorage` key
  vault, and main-process streaming AI proxy with the docked chat. (Consult `claude-api` skill first.)
- **Plan 4 — Release, Packaging & GitHub.** electron-builder NSIS + portable targets; code-sign with the
  "Corner Spore" cert; full README + docs; create the public GitHub repo and publish a `v0.1.0` release
  with installers, mirroring the mcp-command-center pattern.
```
