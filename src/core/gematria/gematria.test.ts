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
    expect(latinToEntry('K')?.latin).toBe('C') // alt of C
    expect(latinToEntry('v')?.latin).toBe('U') // alt of U
  })
  it('returns undefined for unknown', () => {
    expect(runeToEntry('Q')).toBeUndefined()
    expect(latinToEntry('Q')).toBeUndefined()
  })
  it('sums gematria values, ignoring non-runes', () => {
    expect(gematriaSum('ᚠᚢ')).toBe(5) // 2 + 3
    expect(gematriaSum('ᚠ ᚢ.')).toBe(5) // spaces/punct ignored
    expect(gematriaSum('')).toBe(0)
  })
})
