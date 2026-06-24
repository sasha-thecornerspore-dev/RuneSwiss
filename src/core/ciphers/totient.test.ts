import { describe, it, expect } from 'vitest'
import { primeStreamShift, totientStreamShift } from './totient'

describe('prime/totient stream ciphers', () => {
  it('prime stream subtract inverts add', () => {
    const pt = 'ᚠᚢᚦᚩᚱᚳᚷ'
    const ct = primeStreamShift(pt, 'add')
    expect(primeStreamShift(ct, 'sub')).toBe(pt)
  })
  it('shifts first rune by the first prime (2) in add mode', () => {
    // 'ᚠ'(0) + nthPrime(1)=2 -> idx 2 = 'ᚦ'
    expect(primeStreamShift('ᚠ', 'add')).toBe('ᚦ')
  })
  it('totient stream subtract inverts add', () => {
    const pt = 'ᚠᚢᚦᚩᚱᚳᚷ'
    const ct = totientStreamShift(pt, 'add')
    expect(totientStreamShift(ct, 'sub')).toBe(pt)
  })
})
