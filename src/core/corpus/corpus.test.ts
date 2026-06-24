import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { describe, it, expect } from 'vitest'
import { buildCorpus } from './corpus'
import type { CtSection, CorpusSection } from './types'

const here = dirname(fileURLToPath(import.meta.url))
const ctDir = join(here, 'data/sources/cicada_tools')

const sections = readdirSync(ctDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => ({ id: f.replace(/\.json$/, ''), data: JSON.parse(readFileSync(join(ctDir, f), 'utf8')) as CtSection }))

const corpus = buildCorpus(sections)
const byId = (id: string): CorpusSection => corpus.find((s) => s.id === id)!
const latin = (s: CorpusSection) => (s.plainLatin ?? '').toUpperCase().replace(/[^A-Z]/g, '')

describe('Liber Primus corpus', () => {
  it('has all 18 cicada_tools sections, 9 solved + 9 unsolved', () => {
    expect(corpus).toHaveLength(18)
    expect(corpus.filter((s) => s.status === 'solved')).toHaveLength(9)
    expect(corpus.filter((s) => s.status === 'unsolved')).toHaveLength(9)
  })

  it('keeps unsolved sections undecoded but with their ciphertext', () => {
    const unsolved = corpus.filter((s) => s.status === 'unsolved')
    for (const s of unsolved) {
      expect(s.plainLatin).toBeUndefined()
      expect(s.cipherText.length).toBeGreaterThan(0)
    }
  })

  // Every documented solve must decode to its known English plaintext.
  const expected: Record<string, string[]> = {
    '000_a_warning': ['BELIEUENOTHNGFROMTHISBOOC', 'FORALLISSACRED'],
    '001_welcome': ['WELCOMEWELCOMEPILGRIM', 'JOURNEY'],
    '002_some_wisdom': ['THEPRIMESARESACRED', 'SHOULDBEENCRY'],
    '003_a_koan': ['AMANDECIDEDTOGOANDSTUDY', 'MASTER'],
    '004_the_loss_of_divinity': ['LOSSOFDIUINITY'],
    '005_a_koan': ['CIRCUMFERENCE', 'THEMASTER'],
    // direct Gematria renders QUESTION->CWESTIAN, O->A, V->U
    '006_an_instruction': ['ANINSTRUCTIAN', 'DISCOUER'],
    '016_an_end': ['ANENDWITHINTHEDEEPWEB'],
    '017_parable': ['PARABLE', 'INSTAR'],
  }

  for (const [id, landmarks] of Object.entries(expected)) {
    it(`decodes ${id} to documented plaintext`, () => {
      const s = byId(id)
      expect(s.status).toBe('solved')
      const text = latin(s)
      for (const mark of landmarks) expect(text).toContain(mark)
    })
  }
})
