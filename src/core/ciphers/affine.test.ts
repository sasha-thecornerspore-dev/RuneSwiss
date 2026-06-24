import { describe, it, expect } from 'vitest'
import { affineEncrypt, affineDecrypt, autokeyEncrypt, autokeyDecrypt } from './affine'

describe('affine', () => {
  it('decrypt inverts encrypt', () => {
    const pt = 'ᚠᚢᚦᚩᚱᚳᚷ'
    expect(affineDecrypt(affineEncrypt(pt, 5, 8), 5, 8)).toBe(pt)
  })
  it('throws when a is not coprime to 29 (only multiples of 29 are non-coprime)', () => {
    expect(() => affineEncrypt('ᚠ', 29, 0)).toThrow()
  })
})

describe('autokey', () => {
  it('decrypt inverts encrypt', () => {
    const pt = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻ'
    expect(autokeyDecrypt(autokeyEncrypt(pt, 'ᚦ'), 'ᚦ')).toBe(pt)
  })
})
