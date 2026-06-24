import { describe, it, expect } from 'vitest'
import { atbash } from './atbash'

describe('atbash', () => {
  it('reflects index i -> 28-i', () => {
    expect(atbash('ᚠ')).toBe('ᛠ') // 0 -> 28
    expect(atbash('ᛠ')).toBe('ᚠ') // 28 -> 0
  })
  it('is self-inverse', () => {
    const s = 'ᚠᚢᚦᚩᚱᚳᚷ'
    expect(atbash(atbash(s))).toBe(s)
  })
  it('preserves non-runes', () => {
    expect(atbash('ᚠ ᚠ')).toBe('ᛠ ᛠ')
  })
})
