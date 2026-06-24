// Regression proof: the RuneSwiss engine reproduces documented Cicada 3301 Liber Primus solves
// from the genuine ciphertext. The ciphertext + declared transform (key, interrupt indices) come
// verbatim from the vendored cicada_tools section files (see data/sources/ATTRIBUTION.md).
// If a future engine or data change breaks a historical solve, these tests fail loudly.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { describe, it, expect } from 'vitest'
import { atbash } from '../ciphers/atbash'
import { vigenereInterrupt } from '../ciphers/vigenere'
import { runesToLatin } from '../translit/translit'

const here = dirname(fileURLToPath(import.meta.url))

interface Section {
  title: string
  transformers: { type: string; key?: string; interrupt_indices?: number[] }[]
  pages: { filename: string; text: string }[]
}

const loadSection = (name: string): Section =>
  JSON.parse(readFileSync(join(here, 'data/sources/cicada_tools', name), 'utf8'))

// cicada_tools wraps heading spans in < >; those are annotations, not ciphertext. Strip them and
// join the section's pages into one rune stream (interrupt indices count runes across the section).
const cipherText = (s: Section): string => s.pages.map((p) => p.text).join('\n').replace(/[<>]/g, '')

// reduce a decoded transliteration to bare uppercase letters for landmark matching
const letters = (s: string): string => runesToLatin(s).toUpperCase().replace(/[^A-Z]/g, '')

describe('solved-page regression: engine reproduces documented Cicada solves', () => {
  it('A WARNING decodes via Atbash (reversed Gematria)', () => {
    const out = letters(atbash(cipherText(loadSection('000_a_warning.json'))))
    // canonical transliteration artifacts: BELIEVE->BELIEUE, BOOK->BOOC, NOTHING->NOTHNG
    expect(out).toContain('BELIEUENOTHNGFROMTHISBOOC')
    expect(out).toContain('EXPERIENCEYOURDEATH')
    expect(out.endsWith('FORALLISSACRED')).toBe(true)
  })

  it('WELCOME decodes via interrupt-aware Vigenère (key DIVINITY, subtracted)', () => {
    const s = loadSection('001_welcome.json')
    const t = s.transformers[0]
    const out = letters(
      vigenereInterrupt(cipherText(s), t.key!, {
        mode: 'sub',
        interruptIndices: t.interrupt_indices,
      }),
    )
    expect(out.startsWith('WELCOMEWELCOMEPILGRIMTOTHEGREATJOURNEYTOWARDTHEENDOFALL')).toBe(true)
  })

  it('SOME WISDOM is direct Gematria (no cipher)', () => {
    const out = letters(cipherText(loadSection('002_some_wisdom.json')))
    expect(out).toContain('THEPRIMESARESACRED')
    expect(out).toContain('THETOTIENTFUNCTI') // FUNCTION -> FUNCTIAN canonical artifact
    expect(out).toContain('SHOULDBEENCRY')
  })
})
