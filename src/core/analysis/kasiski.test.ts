import { describe, it, expect } from 'vitest'
import { kasiskiCandidates, friedmanKeyLength } from './kasiski'
import { vigenereEncrypt } from '../ciphers/vigenere'

describe('kasiski', () => {
  it('recovers a planted period as a top candidate', () => {
    // repetitive plaintext enciphered with a length-3 key tends to expose period 3
    const pt = 'ᚠᚢᚦᚩᚱᚳ'.repeat(6)
    const ct = vigenereEncrypt(pt, 'ᚠᚢᚦ', 'add')
    const top = kasiskiCandidates(ct).map((c) => c.keyLength)
    expect(top).toContain(3)
  })
})

describe('friedman', () => {
  it('returns a positive estimate', () => {
    const ct = vigenereEncrypt('ᚠᚢᚦᚩᚱᚳ'.repeat(20), 'ᚠᚢᚦᚩ', 'add')
    expect(friedmanKeyLength(ct)).toBeGreaterThan(0)
  })
})
