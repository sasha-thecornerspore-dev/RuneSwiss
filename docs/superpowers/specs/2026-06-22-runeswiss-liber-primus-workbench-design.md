# RuneSwiss — Liber Primus Cryptanalysis Workbench

**Status:** Draft for review
**Date:** 2026-06-22
**Location:** `C:\Users\sasha\Documents\Repos\RuneSwiss`
**Author:** Jeff Schatz (jeff.schatz112@gmail.com) + Claude

---

## 1. Summary

RuneSwiss is a self-contained **Electron desktop application** for studying and attacking the
**Liber Primus** — the encrypted runic "book" at the heart of the **Cicada 3301** puzzles.

It is three things in one window:

1. A **corpus reader** — every known/available Liber Primus page in its real runic ciphertext,
   plus the solved-page plaintexts, history, and reference material.
2. An **independent cryptanalysis workbench** — Elder-Futhark/Anglo-Saxon-futhorc translation,
   the Gematria Primus, all known Liber Primus ciphers, and statistical analysis tools.
3. An **AI brainstorming partner** — a docked chat assistant primed with the puzzle's context
   that can see whatever you're currently looking at and reason with you about it.

Everything works **fully offline** except the AI chat, which calls out to a pluggable LLM backend.

### Design pillars

- **Correctness over flash.** The cryptanalysis engine is a pure, UI-free, test-driven TypeScript
  library. The historically *solved* pages become regression tests: the engine must reproduce
  every documented Cicada solve, or the build fails.
- **No fabricated data.** Real, cited ciphertext only. Unsolved pages are sourced from
  community-verified transcriptions with provenance; solved pages are additionally validated by
  round-tripping them through the engine.
- **Isolated, testable units.** Engine, corpus data, Electron shell, and UI are cleanly separated
  and independently understandable.

---

## 2. Goals & non-goals

### Goals (v1)
- Faithful **Gematria Primus** (29-rune ↔ Latin ↔ prime mapping) and reversible transliteration.
- A **Translator** for rune ↔ Latin with live gematria values.
- A bundled, cited **corpus** of the full Liber Primus (runes + solved plaintexts + metadata).
- A **Cipher Lab**: all known LP cipher primitives, composable into pipelines.
- An **Analysis** panel: frequency, Index of Coincidence, Kasiski, Friedman, n-gram, prime/totient.
- A **History & Reference** panel: Cicada 3301 timeline, Gematria table, known solves & methods.
- A **pluggable AI chat** (Claude default; OpenAI-compatible / custom endpoint supported), with the
  key stored securely and all model calls made from the Electron main process.
- A **Notes / hypothesis log** with persistence.
- Windows packaging (NSIS + portable), code-signed with the existing "Corner Spore" cert.

### Non-goals (v1) — YAGNI
- OutGuess / steganography tooling for the original 2012–2014 image puzzles. *(Future scope.)*
- AI autonomously driving the engine (tool-calling into the ciphers). *(Stretch; see §8.)*
- macOS/Linux packaging. *(Codebase stays cross-platform-friendly, but only Windows is built in v1.)*
- Multi-user, cloud sync, or accounts.
- Claiming to *solve* the unsolved pages. RuneSwiss is a workbench, not an oracle.

---

## 3. High-level architecture

```
RuneSwiss/   (electron-vite + React + TypeScript + vitest)
├── src/
│   ├── core/        ← PURE TypeScript engine. Zero Electron/DOM deps. Fully unit-tested.
│   │   ├── gematria/    29-rune table: rune ↔ latin ↔ prime ↔ index; gematria sums
│   │   ├── translit/    rune↔latin incl. multi-char runes (TH, EO, NG, OE, AE, IA, EA), separators
│   │   ├── ciphers/     atbash, shift, vigenere/running-key, totient/prime-shift, affine, autokey,
│   │   │                + a composable transform pipeline
│   │   ├── analysis/    frequency, IoC, Kasiski, Friedman, n-gram search, prime/φ utilities
│   │   └── corpus/      bundled JSON data + typed loaders + validation
│   ├── main/        ← Electron main: window/tray lifecycle, safeStorage key vault, AI proxy, file I/O
│   ├── preload/     ← typed contextBridge `api` (ai.chat, secrets, corpus, notes, settings)
│   └── renderer/    ← React workbench UI (the panels)
├── docs/superpowers/specs/   ← this document
└── build/           ← electron-builder config, icon, signing
```

### Process / trust boundaries
- **core** is a library with no I/O and no platform deps. It can run in Node (tests) or the browser
  (renderer) unchanged. This is where all cryptography lives and where TDD is enforced.
- **main** owns anything privileged: the encrypted API key (`safeStorage`), filesystem reads/writes
  (notes, corpus overrides), and **all outbound LLM calls** — so the key never enters the renderer
  and we sidestep browser CORS.
- **preload** exposes a narrow, typed IPC surface via `contextBridge`; `nodeIntegration: false`,
  `contextIsolation: true` (matching the security posture already used in openclaw-desktop).
- **renderer** is the React UI. It imports `core` directly (pure functions) and talks to `main`
  through the preload `api` for anything privileged.

### Recommended stack
`electron-vite` + **React** + **TypeScript** + **vitest**.
*Alternatives considered:* vanilla TS (lighter, but more hand-written UI plumbing for a panel- and
chat-heavy app) and Svelte (minimal runtime). React is chosen for the multi-panel + streaming-chat UI.

---

## 4. The core engine (the "independent cryptography app")

### 4.1 Gematria Primus
The canonical 29-rune mapping. Each rune maps to a Latin letter/letter-group, an index 0–28, and the
nth prime (2…109). Transliterating the runes in order spells **F-U-TH-O-R-C…** (the futhorc).

| # | Rune | Latin | Prime | | # | Rune | Latin | Prime |
|---|------|-------|-------|-|---|------|-------|-------|
| 0  | ᚠ | F      | 2  | | 15 | ᛋ | S/Z    | 53  |
| 1  | ᚢ | U/V    | 3  | | 16 | ᛏ | T      | 59  |
| 2  | ᚦ | TH/þ   | 5  | | 17 | ᛒ | B      | 61  |
| 3  | ᚩ | O      | 7  | | 18 | ᛖ | E      | 67  |
| 4  | ᚱ | R      | 11 | | 19 | ᛗ | M      | 71  |
| 5  | ᚳ | C/K    | 13 | | 20 | ᛚ | L      | 73  |
| 6  | ᚷ | G      | 17 | | 21 | ᛝ | NG/ING | 79  |
| 7  | ᚹ | W      | 19 | | 22 | ᛟ | OE     | 83  |
| 8  | ᚻ | H      | 23 | | 23 | ᛞ | D      | 89  |
| 9  | ᚾ | N      | 29 | | 24 | ᚪ | A      | 97  |
| 10 | ᛁ | I      | 31 | | 25 | ᚫ | AE     | 101 |
| 11 | ᛄ | J      | 37 | | 26 | ᚣ | Y      | 103 |
| 12 | ᛇ | EO     | 41 | | 27 | ᛡ | IA/IO  | 107 |
| 13 | ᛈ | P      | 43 | | 28 | ᛠ | EA     | 109 |
| 14 | ᛉ | X      | 47 | |    |   |        |     |

API (illustrative): `runeToLatin`, `latinToRune`, `runeToValue`, `runeToIndex`, `indexToRune`,
`gematriaSum(text)`. The exact rune Unicode codepoints and any disputed Latin digraphs are confirmed
during the corpus-research step (§5) against cited sources and locked by tests.

### 4.2 Transliteration
Reversible rune↔Latin. Handles every multi-character rune (TH, EO, NG, OE, AE, IA, EA), the runic
word/section separators (e.g. `᚛`/`᛫`/`᛬` and the LP's dot/cross marks), and non-rune characters
(passed through). Latin→rune uses longest-match tokenization so "ING" and "EA" map to single runes.

### 4.3 Ciphers
Each cipher is a pure function over the 29-rune alphabet (operating on indices 0–28, mod 29),
invertible where the math allows, and **total** — it returns diagnostics instead of throwing on
malformed input:
- **Atbash** (reflect index `i → 28 - i`).
- **Shift / Caesar** by N.
- **Vigenère & running-key** — key supplied as runes, as Latin, or as a numeric/prime stream;
  add or subtract mod 29. (The documented LP solve used Vigenère with key **DIVINITY** and
  running keys.)
- **Totient / prime-index shift** — shift each position by a function of primes or Euler's
  totient φ (the LP used totient-based transforms).
- **Affine** (`y = a·x + b mod 29`, a coprime to 29).
- **Autokey.**
- **Transform pipeline** — chain primitives (e.g. Atbash → subtract running key → shift φ) with each
  stage's output visualized.

> Note: 29 is prime, which makes modular inverses for affine/shift clean across the whole alphabet —
> a property the puzzle's designers exploited and the engine relies on.

### 4.4 Analysis
- **Frequency** (per-rune counts, with an expected-English-letter overlay after transliteration).
- **Index of Coincidence** over the 29-rune alphabet (monographic; flags key length / language).
- **Kasiski** — repeated n-gram spacing → GCD → probable key length.
- **Friedman** key-length estimate.
- **N-gram search** across the entire corpus (find a rune/Latin sequence anywhere).
- **Prime/number utilities** — `isPrime`, `nthPrime`, `primeFactors`, Euler `totient`, used both by
  ciphers and for gematria-driven hypotheses.

---

## 5. The corpus (real, cited data)

### 5.1 Data model (bundled JSON, typed + validated)
```
Page {
  id            // stable id, e.g. "lp2014-p07" or "koan-1"
  section       // grouping / title
  order         // display order
  runeText      // Unicode runes (the ciphertext) — source of truth
  transliteration  // derived F-U-TH-O-R-C tokens (also recomputable by the engine)
  status        // "solved" | "partial" | "unsolved"
  solution? { plaintext, cipher, key, method, notes }
  provenance    // { source, url, retrievedAt, confidence }
}
```
Plus: the `gematria` table, and a `history` timeline dataset (the 2012→2014 Cicada saga, each solved
page and the method used) powering the History & Reference panel.

### 5.2 Sourcing & honesty guardrails
- During the build, fetch **community-verified transcriptions** of the full Liber Primus, normalize
  to Unicode runes, and bundle them as JSON with a `provenance` record (source + URL + retrieval date
  + confidence) on every page.
- **Validate solved pages by construction:** each `solved` page must decode to its recorded plaintext
  when its recorded cipher+key are run through the engine. This is an objective correctness check and
  becomes part of the test suite.
- **Unsolved pages** can only be verified structurally (valid rune set, plausible length); they are
  marked accordingly, and the UI shows their `confidence`.
- **User-override layer:** a writable corpus directory in the app data dir lets the user correct or
  annotate any page without modifying bundled data. Overrides shadow bundled pages at load time.

### 5.3 Corpus research is an implementation-phase workflow
Gathering and cross-verifying the transcriptions, the exact solved-page plaintexts, the cipher/key
for each solve, and the historical timeline is done as a dedicated multi-source research-and-verify
pass during implementation (fan-out fetch → cross-check → bundle), not hand-authored from memory.

---

## 6. UI — "cryptic terminal / cicada" aesthetic

Dark near-black, monospace, a subtle cicada motif, a single accent glow (cyan or amber, themeable).
Layout: **left icon rail** · **main workspace** · **collapsible AI chat dock** on the right.

Panels:
1. **Reader** — every page in real runes; hover any rune for its Latin + prime value; toggle
   runes / transliteration / plaintext; solved pages show their solution & method; full-text search.
2. **Translator** — live two-way rune↔Latin, gematria sum, one-click copy. *(The "translate Elder
   Futhark" requirement.)*
3. **Cipher Lab** — load a page or paste text; build a transform pipeline; output updates live;
   push results to Notes.
4. **Analysis** — run frequency / IoC / Kasiski / Friedman / n-gram on any text or page, rendered in
   the terminal style.
5. **History & Reference** — Cicada timeline, the Gematria Primus table, known solves + methods,
   glossary.
6. **AI Brainstorm** (dock) — primed with the Gematria Primus + known solves; handed the current
   context (active page, selection, last analysis result) so you can ask "what key length does this
   IoC suggest?" or "try to read this stretch."
7. **Notes / Hypothesis log** — persistent findings, saved sessions, pinned ideas.
- **Settings** — AI provider + key, accent color, corpus-override management.

---

## 7. AI integration (secure & pluggable)

- A `LLMProvider` interface with two implementations:
  - **Anthropic** (default, `claude-opus-4-8`) — streaming.
  - **OpenAI-compatible** — covers Ollama, the local OpenClaw gateway, or any custom base URL.
- API key encrypted at rest via Electron **`safeStorage`**.
- **All model calls happen in the main process.** The renderer sends messages over IPC
  (`api.ai.chat`), and tokens stream back. The key never enters the renderer; no CORS.
- The assistant's system prompt carries the Gematria Primus, the known solves, and the live workspace
  context handed to it by the active panel.
- When the Anthropic provider is implemented, the `claude-api` reference skill is consulted first for
  correct model ids, streaming, and parameters.

---

## 8. Stretch & future scope (explicitly out of v1)
- **AI-drives-the-engine:** expose the ciphers/analysis as tools the assistant can call
  ("run Vigenère key X on page 5") and read results back. Designed-for but not built in v1.
- **Steganography / OutGuess** tooling for the original image puzzles.
- macOS/Linux builds.

---

## 9. Testing, errors, packaging

- **vitest** unit tests on `core`:
  - Gematria round-trip (rune→latin→rune is identity for all 29).
  - Each cipher's invertibility (decrypt∘encrypt = identity).
  - **Solved-page regression tests** (every solved corpus page decodes to its recorded plaintext).
  - Analysis sanity (e.g. IoC of known plaintext vs. random; Kasiski finds a planted period).
- **Errors:** AI failures surface in chat (bad key / offline / rate-limit) with actionable text;
  corpus import is schema-validated; cipher ops never throw on junk input (return diagnostics).
- **Packaging:** electron-builder → NSIS installer + portable exe; Windows build code-signed with the
  shared "Corner Spore" self-signed cert.

---

## 10. Build order (each slice independently testable)

1. **Scaffold** — electron-vite + React + TS + vitest; cryptic theme shell + nav rail; secure
   `webPreferences`; typed preload skeleton.
2. **Gematria + translation** (TDD) → **Translator** panel.
3. **Corpus research + schema + loaders** (fetch, validate, bundle) → **Reader** panel.
4. **Ciphers** (TDD) → **Cipher Lab**.
5. **Analysis** (TDD) → **Analysis** panel.
6. **AI provider abstraction + main-process proxy + chat dock + Settings** (consult `claude-api`).
7. **History & Reference + Notes / hypothesis log.**
8. **Package & code-sign.**

---

## 11. Open questions / risks

- **Corpus completeness & accuracy.** Depends on what's publicly available and verifiable. Mitigation:
  cite provenance per page, validate all solved pages via the engine, expose confidence, allow
  user overrides.
- **Rune Unicode & digraph edge cases.** Disputed Latin mappings (e.g. IA vs IO, ING vs NG) are locked
  by tests against cited sources during corpus research.
- **AI backend variance.** Different providers return different streaming/usage shapes; the
  `LLMProvider` interface normalizes this, and the OpenAI-compatible path is tested against at least
  one concrete endpoint.
```
