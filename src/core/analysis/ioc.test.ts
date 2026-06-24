import { describe, it, expect } from 'vitest'
import { indexOfCoincidence } from './ioc'

describe('indexOfCoincidence', () => {
  it('is 1.0 for a single repeated rune', () => {
    expect(indexOfCoincidence('ᚠᚠᚠᚠ')).toBeCloseTo(1)
  })
  it('is ~0 for an empty or one-rune text', () => {
    expect(indexOfCoincidence('ᚠ')).toBe(0)
  })
})
