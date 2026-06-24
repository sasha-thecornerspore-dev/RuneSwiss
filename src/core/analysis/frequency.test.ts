import { describe, it, expect } from 'vitest'
import { frequencies, runeCount } from './frequency'

describe('frequencies', () => {
  it('counts runes and ignores non-runes', () => {
    expect(runeCount('ᚠᚠᚢ x')).toBe(3)
    const f = frequencies('ᚠᚠᚢ')
    expect(f).toHaveLength(29)
    expect(f[0].count).toBe(2) // ᚠ
    expect(f[1].count).toBe(1) // ᚢ
    expect(f[0].proportion).toBeCloseTo(2 / 3)
  })
})
