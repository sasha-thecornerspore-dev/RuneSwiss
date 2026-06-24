import { describe, it, expect } from 'vitest'
import { findNgram } from './ngram'

describe('findNgram', () => {
  it('finds rune positions of a runic needle', () => {
    expect(findNgram('ᚠᚢᚦᚠᚢ', 'ᚠᚢ')).toEqual([0, 3])
  })
  it('accepts a latin needle', () => {
    expect(findNgram('ᚠᚢᚦ', 'FU')).toEqual([0])
  })
})
