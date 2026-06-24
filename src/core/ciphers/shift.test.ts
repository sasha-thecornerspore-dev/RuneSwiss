import { describe, it, expect } from 'vitest'
import { shift, unshift } from './shift'

describe('shift', () => {
  it('shifts forward mod 29 and wraps', () => {
    expect(shift('ᚠ', 1)).toBe('ᚢ') // 0 -> 1
    expect(shift('ᛠ', 1)).toBe('ᚠ') // 28 -> 0 (wrap)
  })
  it('unshift inverts shift', () => {
    const s = 'ᚠᚢᚦᚩᚱ'
    expect(unshift(shift(s, 7), 7)).toBe(s)
  })
})
