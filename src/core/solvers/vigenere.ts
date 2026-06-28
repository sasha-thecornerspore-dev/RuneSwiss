import { ALPHABET_SIZE } from '../gematria/table'
import { runeToEntry, indexToEntry } from '../gematria/gematria'
import { mod } from '../alphabet/ops'
import { indexOfCoincidence } from '../analysis/ioc'
import { chiSquaredEnglish, fitness, toLatinLetters } from '../analysis/score'
import { runesToLatin } from '../translit/translit'

function runeIndices(text: string): number[] {
  const idx: number[] = []
  for (const ch of text) {
    const e = runeToEntry(ch)
    if (e) idx.push(e.index)
  }
  return idx
}
const indicesToRuneStr = (idx: number[]): string => idx.map((i) => indexToEntry(mod(i))!.rune).join('')
// LP convention: plaintext = ciphertext − key (mod 29).
const decryptWithKey = (idx: number[], key: number[]): number[] =>
  idx.map((c, i) => mod(c - key[i % key.length]))

export interface KeyLengthScore {
  keyLength: number
  ioc: number
}

/** Rank candidate Vigenère key lengths by average per-column Index of Coincidence (best first). */
export function vigenereKeyLengthScores(text: string, maxLen = 20): KeyLengthScore[] {
  const idx = runeIndices(text)
  const res: KeyLengthScore[] = []
  const cap = Math.min(maxLen, Math.max(1, Math.floor(idx.length / 2)))
  for (let L = 1; L <= cap; L++) {
    let sum = 0
    for (let c = 0; c < L; c++) {
      const col = idx.filter((_, i) => i % L === c)
      sum += indexOfCoincidence(indicesToRuneStr(col))
    }
    res.push({ keyLength: L, ioc: sum / L })
  }
  return res.sort((a, b) => b.ioc - a.ioc)
}

export interface VigenereSolution {
  keyIndices: number[]
  keyRunes: string
  keyLatin: string
  output: string
  latin: string
  score: number
}

function solutionFor(idx: number[], key: number[]): VigenereSolution {
  const output = indicesToRuneStr(decryptWithKey(idx, key))
  return {
    keyIndices: key.slice(),
    keyRunes: indicesToRuneStr(key),
    keyLatin: runesToLatin(indicesToRuneStr(key)),
    output,
    latin: toLatinLetters(output),
    score: fitness(output),
  }
}

/** Recover a Vigenère key of the given length column-by-column (best English fit per column). */
export function solveVigenereColumns(text: string, keyLength: number): VigenereSolution {
  const idx = runeIndices(text)
  const key: number[] = []
  for (let c = 0; c < keyLength; c++) {
    const col = idx.filter((_, i) => i % keyLength === c)
    let bestK = 0
    let bestChi = Infinity
    for (let k = 0; k < ALPHABET_SIZE; k++) {
      const chi = chiSquaredEnglish(toLatinLetters(indicesToRuneStr(col.map((v) => mod(v - k)))))
      if (chi < bestChi) {
        bestChi = chi
        bestK = k
      }
    }
    key.push(bestK)
  }
  return solutionFor(idx, key)
}

/** Refine a key-length guess with hill-climbing on full-text fitness (seeded from the column solve). */
export function hillClimbVigenere(text: string, keyLength: number, iterations = 3000): VigenereSolution {
  const idx = runeIndices(text)
  const key = solveVigenereColumns(text, keyLength).keyIndices
  let best = fitness(indicesToRuneStr(decryptWithKey(idx, key)))
  for (let it = 0; it < iterations; it++) {
    const pos = Math.floor(Math.random() * keyLength)
    const prev = key[pos]
    key[pos] = Math.floor(Math.random() * ALPHABET_SIZE)
    const s = fitness(indicesToRuneStr(decryptWithKey(idx, key)))
    if (s > best) best = s
    else key[pos] = prev
  }
  return solutionFor(idx, key)
}
