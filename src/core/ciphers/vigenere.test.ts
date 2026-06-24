import { describe, it, expect } from 'vitest'
import { vigenereEncrypt, vigenereDecrypt, keyToIndices, vigenereInterrupt } from './vigenere'

describe('vigenere', () => {
  it('accepts a latin key and maps to indices', () => {
    // DIVINITY -> D(89→idx23) I(31→10) V(U,3→1) I(10) N(29→9) I(10) T(59→16) Y(103→26)
    expect(keyToIndices('DIVINITY')).toEqual([23, 10, 1, 10, 9, 10, 16, 26])
  })
  it('decrypt inverts encrypt for add mode', () => {
    const pt = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾ'
    const ct = vigenereEncrypt(pt, 'ᚠᚢᚦ', 'add')
    expect(vigenereDecrypt(ct, 'ᚠᚢᚦ', 'add')).toBe(pt)
  })
  it('decrypt inverts encrypt for sub mode', () => {
    const pt = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾ'
    const ct = vigenereEncrypt(pt, 'DIVINITY', 'sub')
    expect(vigenereDecrypt(ct, 'DIVINITY', 'sub')).toBe(pt)
  })
  it('keys on rune positions, ignoring interleaved non-runes', () => {
    // key 'ᚢ'(+1) applied to every rune regardless of spaces
    expect(vigenereEncrypt('ᚠ ᚠ', 'ᚢ', 'add')).toBe('ᚢ ᚢ')
  })
})

describe('vigenereInterrupt', () => {
  it('matches plain vigenere when there are no interrupts', () => {
    const pt = 'ᚠᚢᚦᚩᚱᚳᚷ'
    expect(vigenereInterrupt(pt, 'ᚠᚢᚦ', { mode: 'add' })).toBe(vigenereEncrypt(pt, 'ᚠᚢᚦ', 'add'))
  })
  it('passes interrupt runes through unchanged and does not advance the key', () => {
    // index 0 is an interrupt: ᚠ passes through; ᚢ(1) + key ᚢ(1) = 2 = ᚦ
    expect(vigenereInterrupt('ᚠᚢ', 'ᚢ', { mode: 'add', interruptIndices: [0] })).toBe('ᚠᚦ')
  })
  it('can drop interrupt runes instead of passing them through', () => {
    expect(
      vigenereInterrupt('ᚠᚢ', 'ᚢ', { mode: 'add', interruptIndices: [0], dropInterrupts: true }),
    ).toBe('ᚦ')
  })
})
