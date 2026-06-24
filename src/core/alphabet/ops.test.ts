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
