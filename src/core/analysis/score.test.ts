import { describe, it, expect } from 'vitest'
import { chiSquaredEnglish, wordHits, fitness, toLatinLetters } from './score'
import { latinToRunes } from '../translit/translit'

describe('english scoring', () => {
  it('rates English far below gibberish (lower chi = more English)', () => {
    expect(chiSquaredEnglish('THEPRIMESARESACREDANDALLTHINGS')).toBeLessThan(
      chiSquaredEnglish('XQZJXQZJXQZJXQZJXQZJ'),
    )
  })
  it('counts known words including Liber Primus landmarks', () => {
    expect(wordHits('THESACREDPRIMES')).toBeGreaterThanOrEqual(2)
    expect(wordHits('CIRCUMFERENCE')).toBe(1)
  })
  it('fitness prefers real plaintext over rune gibberish', () => {
    const pt = latinToRunes('THEPRIMESARESACREDTHETOTIENTISSACRED')
    expect(fitness(pt)).toBeGreaterThan(fitness('ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄ'))
    expect(toLatinLetters(pt)).toContain('SACRED')
  })
})
