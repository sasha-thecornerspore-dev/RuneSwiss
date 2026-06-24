import { describe, it, expect } from 'vitest'
import {
  GEMATRIA,
  runeToValue,
  gematriaSum,
  runesToLatin,
  latinToRunes,
  atbash,
  shift,
  vigenereEncrypt,
  vigenereDecrypt,
  primeStreamShift,
  affineEncrypt,
  affineDecrypt,
  runPipeline,
  isPrime,
  totient,
  frequencies,
  indexOfCoincidence,
  kasiskiCandidates,
  findNgram,
} from './index'

describe('core public API', () => {
  it('re-exports the full surface and round-trips a vigenere decrypt', () => {
    expect(GEMATRIA).toHaveLength(29)
    const pt = 'ᚠᚢᚦᚩᚱᚳ'
    const ct = vigenereEncrypt(pt, 'DIVINITY', 'sub')
    expect(vigenereDecrypt(ct, 'DIVINITY', 'sub')).toBe(pt)
    expect(typeof runeToValue('ᚠ')).toBe('number')
    expect(runesToLatin(latinToRunes('FUTHORC'))).toBe('FUTHORC')
    expect(isPrime(2)).toBe(true)
    // reference the rest so the barrel is exercised
    void [
      gematriaSum,
      atbash,
      shift,
      primeStreamShift,
      affineEncrypt,
      affineDecrypt,
      runPipeline,
      totient,
      frequencies,
      indexOfCoincidence,
      kasiskiCandidates,
      findNgram,
    ]
  })
})
