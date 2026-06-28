import { runesToLatin } from '../translit/translit'

// Expected English monogram frequencies (%) — used to score how "English-like" a decrypt is.
// The Liber Primus transliterates with canonical digraphs and C/U for C-K / U-V, which skews the
// distribution slightly, but E/T/A/O still dominate real plaintext, so this discriminates well.
const ENGLISH_FREQ: Record<string, number> = {
  E: 12.7, T: 9.06, A: 8.17, O: 7.51, I: 6.97, N: 6.75, S: 6.33, H: 6.09, R: 5.99,
  D: 4.25, L: 4.03, C: 2.78, U: 2.76, M: 2.41, W: 2.36, F: 2.23, G: 2.02, Y: 1.97,
  P: 1.93, B: 1.29, V: 0.98, K: 0.77, J: 0.15, X: 0.15, Q: 0.1, Z: 0.07,
}

// Common English words + Liber Primus landmarks (canonical spellings: BOOC, BELIEUE, DIUINITY…).
const WORDS = [
  'THE', 'AND', 'THAT', 'YOU', 'FOR', 'ARE', 'WITH', 'THIS', 'YOUR', 'NOT', 'ALL', 'BUT', 'HAUE',
  'WELCOME', 'PILGRIM', 'IOURNEY', 'CIRCUMFERENCE', 'INSTAR', 'DIUINITY', 'PRIMES', 'TOTIENT',
  'SACRED', 'WISDOM', 'TRUTH', 'KNOW', 'BOOC', 'BELIEUE', 'MASTER', 'WITHIN', 'REALITY', 'MIND',
  'SELF', 'PARABLE', 'INSTRUCTION', 'CONSUMPTION', 'PRESERUATION', 'ADHERENCE', 'EMERGE',
]

/** Reduce runic (or mixed) text to bare uppercase A–Z letters via transliteration. */
export function toLatinLetters(text: string): string {
  return runesToLatin(text).toUpperCase().replace(/[^A-Z]/g, '')
}

/** Chi-squared distance of a letter string from English. Lower = more English-like. */
export function chiSquaredEnglish(latin: string): number {
  const n = latin.length
  if (n === 0) return Infinity
  const counts: Record<string, number> = {}
  for (const ch of latin) counts[ch] = (counts[ch] ?? 0) + 1
  let chi = 0
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i)
    const expected = ((ENGLISH_FREQ[letter] ?? 0.05) / 100) * n
    const observed = counts[letter] ?? 0
    chi += ((observed - expected) ** 2) / (expected || 1)
  }
  return chi
}

/** Count occurrences of known English / Liber Primus words in a letter string. */
export function wordHits(latin: string): number {
  let hits = 0
  for (const w of WORDS) {
    let from = 0
    let idx: number
    while ((idx = latin.indexOf(w, from)) >= 0) {
      hits++
      from = idx + 1
    }
  }
  return hits
}

/**
 * Fitness of a runic candidate plaintext — higher is better. Combines a strong bonus for real-word
 * hits with a penalty for distance from English letter frequencies. Used to rank attack results.
 */
export function fitness(runicText: string): number {
  const latin = toLatinLetters(runicText)
  if (!latin) return -Infinity
  return wordHits(latin) * 12 - chiSquaredEnglish(latin) / Math.max(latin.length, 1)
}
