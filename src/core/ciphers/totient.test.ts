import { describe, it, expect } from 'vitest'
import { primeStreamShift, totientStreamShift, totientPrimeInterrupt } from './totient'

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

  it('totientPrimeInterrupt inverts itself and passes interrupts through', () => {
    const pt = 'ᚠᚢᚦᚩᚱᚳᚷᚹ'
    const ct = totientPrimeInterrupt(pt, { mode: 'add' })
    expect(totientPrimeInterrupt(ct, { mode: 'sub' })).toBe(pt)
    // index 0 is an interrupt -> ᚠ passes through unchanged
    expect(totientPrimeInterrupt('ᚠᚢ', { mode: 'add', interruptIndices: [0] }).startsWith('ᚠ')).toBe(true)
  })
})
