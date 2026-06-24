# ᚱ RuneSwiss

**A cryptanalysis workbench for the [Liber Primus](https://en.wikipedia.org/wiki/Cicada_3301) — the encrypted runic book of the Cicada 3301 puzzles.**

RuneSwiss is a self-contained desktop app (Electron) that combines three things in one window:

1. **A corpus reader** — every known Liber Primus page in its real runic ciphertext, plus the solved-page plaintexts, history, and reference material.
2. **An independent cryptography workbench** — Elder-Futhark / Anglo-Saxon-futhorc translation, the Gematria Primus, every known Liber Primus cipher, and statistical cryptanalysis.
3. **An AI brainstorming partner** — a docked chat assistant (pluggable: Claude by default) that can see what you're working on and reason with you about it.

Everything works **offline** except the AI chat.

> **Status:** under active construction. The cryptography engine (Plan 1) and the verified corpus foundation (Plan 2, in progress) are complete and tested. The desktop UI (Plan 3) and packaged installers (Plan 4) are next. See [`docs/superpowers/`](docs/superpowers/) for the design spec and plans.

---

## Why it's different: it proves the historical solves

The engine is a pure, UI-free, **test-driven** TypeScript core, and the documented Cicada solves are wired up as **regression tests**. Run `npm test` and the engine decrypts the *genuine* Liber Primus ciphertext to its known English plaintext — or the build fails:

| Page | Cipher | Decodes to |
|------|--------|-----------|
| **A Warning** | Atbash (reversed Gematria) | `A WARNING. BELIEVE NOTHING FROM THIS BOOK … FOR ALL IS SACRED.` |
| **Welcome** | Vigenère, key `DIVINITY`, with `ᚠ`-rune interrupts | `WELCOME. WELCOME, PILGRIM, TO THE GREAT JOURNEY TOWARD THE END OF ALL THINGS…` |
| **Some Wisdom** | Direct Gematria | `THE PRIMES ARE SACRED. THE TOTIENT FUNCTION IS SACRED. ALL THINGS SHOULD BE ENCRYPTED.` |

(The runic ciphertext is captured **verbatim** from machine-readable community transcriptions — never retyped — so it's byte-faithful. See [`src/core/corpus/data/sources/ATTRIBUTION.md`](src/core/corpus/data/sources/ATTRIBUTION.md).)

---

## The engine (`src/core`)

Pure, isomorphic, zero Electron/DOM dependencies — it runs identically in Node and the browser.

- **Gematria Primus** — the 29-rune ↔ Latin ↔ prime table (ᚠ=F=2 … ᛠ=EA=109), lookups, gematria sums.
- **Transliteration** — reversible rune↔Latin with longest-match multi-char runes (`THING` → ᚦᛝ) and the runic separators.
- **Ciphers** — Atbash, shift, Vigenère / running-key, **interrupt-aware Vigenère** (the LP `ᚠ`-skip), prime-stream, totient-stream, affine, autokey, and a composable transform **pipeline**.
- **Math** — `isPrime`, `nthPrime`, `primeFactors`, Euler totient φ.
- **Analysis** — frequency, Index of Coincidence, Kasiski, Friedman, n-gram search.

```ts
import { vigenereInterrupt, runesToLatin } from './src/core'
// decrypt the LP "Welcome" page: subtract key DIVINITY, ᚠ runes are interrupts
const plain = vigenereInterrupt(ciphertext, 'DIVINITY', { mode: 'sub', interruptIndices })
console.log(runesToLatin(plain)) // WELCOME WELCOME PILGRIM ...
```

---

## Develop

```bash
npm install
npm test          # run the full Vitest suite (engine + solved-page regressions)
npm run typecheck # strict TypeScript, no emit
npm run dev       # launch the Electron app (UI lands in Plan 3)
```

**Tech stack:** Electron + electron-vite + React + TypeScript + Vitest. Node ≥ 20.

---

## Roadmap

- [x] **Plan 1 — Core engine** (Gematria, transliteration, ciphers, analysis; fully TDD).
- [~] **Plan 2 — Corpus** (verbatim transcription, solved-page regressions, full page model, history timeline).
- [ ] **Plan 3 — Desktop app & AI** (cryptic-terminal UI: Reader, Translator, Cipher Lab, Analysis, History, Notes; pluggable AI chat).
- [ ] **Plan 4 — Release** (NSIS + portable installers, code-signed; GitHub release).

---

## Credits & disclaimer

RuneSwiss is an independent study/research tool. The Liber Primus and Cicada 3301 puzzle material is public; bundled transcriptions are credited in [`ATTRIBUTION.md`](src/core/corpus/data/sources/ATTRIBUTION.md). RuneSwiss is not affiliated with Cicada 3301. The Liber Primus remains largely unsolved — this is a workbench, not an oracle.

## License

MIT
