import { describe, it, expect } from 'vitest'
import { runesToLatin, latinToRunes } from './translit'

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

describe('latinToRunes', () => {
  it('greedily matches multi-letter runes', () => {
    expect(latinToRunes('FUTHORC')).toBe('ᚠᚢᚦᚩᚱᚳ')
    expect(latinToRunes('THING')).toBe('ᚦᛝ') // TH + ING, not T-H-I-N-G
    expect(latinToRunes('EOEA')).toBe('ᛇᛠ') // EO + EA
  })
  it('maps spaces to the runic separator', () => {
    expect(latinToRunes('FU THO')).toBe('ᚠᚢ᛫ᚦᚩ')
  })
  it('round-trips canonical text', () => {
    const s = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾ'
    expect(latinToRunes(runesToLatin(s))).toBe(s)
  })
})
