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
    expect(GEMATRIA.slice(0, 6).map((e) => e.latin)).toEqual(['F', 'U', 'TH', 'O', 'R', 'C'])
  })
  it('uses single Unicode runic codepoints', () => {
    GEMATRIA.forEach((e) => expect([...e.rune]).toHaveLength(1))
  })
})
