import { describe, it, expect } from 'vitest'
import { latinToRunes } from '../translit/translit'
import { shift } from '../ciphers/shift'
import { affineEncrypt } from '../ciphers/affine'
import { vigenereEncrypt } from '../ciphers/vigenere'
import { bruteShift, bruteAffine } from './brute'
import { vigenereKeyLengthScores, solveVigenereColumns, hillClimbVigenere } from './vigenere'

// English plaintext using only alphabet-mappable letters (V written as U; no K/Q/J/Z/X).
const ENGLISH =
  'WHENINTHECOURSEOFHUMANEUENTSITBECOMESNECESSARYFORONEPEOPLETODISSOLUETHEPOLITICALBANDSWHICHHAUECONNECTEDTHEMWITHANOTHERANDTOASSUMETHEPOWERSOFTHEEARTH'
const PT = latinToRunes(ENGLISH)

describe('brute-force solvers', () => {
  it('bruteShift recovers a planted shift as the top result', () => {
    const ct = shift(PT, 7)
    expect(bruteShift(ct)[0].latin).toContain('NECESSARY')
  })
  it('bruteAffine recovers a planted affine as the top result', () => {
    const ct = affineEncrypt(PT, 5, 8)
    expect(bruteAffine(ct)[0].latin).toContain('NECESSARY')
  })
})

describe('vigenere key recovery', () => {
  const longPt = latinToRunes(ENGLISH + ENGLISH + ENGLISH)
  const key = 'ᚦᚱᛁᛗ' // 4-rune key; ct = pt + key, so decryption subtracts the key
  const ct = vigenereEncrypt(longPt, key, 'add')

  it('detects the key length via per-column IoC', () => {
    const top = vigenereKeyLengthScores(ct, 12).slice(0, 4).map((s) => s.keyLength)
    expect(top).toContain(4)
  })

  it('recovers the key and plaintext (column solve, hill-climb refine)', () => {
    let sol = solveVigenereColumns(ct, 4)
    if (!sol.latin.includes('NECESSARY')) sol = hillClimbVigenere(ct, 4, 12000)
    expect(sol.latin).toContain('NECESSARY')
  })
})
