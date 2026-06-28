import { shift } from '../ciphers/shift'
import { affineDecrypt } from '../ciphers/affine'
import { ALPHABET_SIZE } from '../gematria/table'
import { fitness, toLatinLetters } from '../analysis/score'

export interface AttackResult {
  params: Record<string, number>
  output: string
  latin: string
  score: number
}

/** Try every shift over the 29-rune alphabet, ranked by English fitness (best first). */
export function bruteShift(text: string): AttackResult[] {
  const out: AttackResult[] = []
  for (let n = 0; n < ALPHABET_SIZE; n++) {
    const output = shift(text, n)
    out.push({ params: { n }, output, latin: toLatinLetters(output), score: fitness(output) })
  }
  return out.sort((a, b) => b.score - a.score)
}

/** Try every affine decrypt (a coprime to 29 — all of 1..28 since 29 is prime), ranked by fitness. */
export function bruteAffine(text: string): AttackResult[] {
  const out: AttackResult[] = []
  for (let a = 1; a < ALPHABET_SIZE; a++) {
    for (let b = 0; b < ALPHABET_SIZE; b++) {
      const output = affineDecrypt(text, a, b)
      out.push({ params: { a, b }, output, latin: toLatinLetters(output), score: fitness(output) })
    }
  }
  return out.sort((x, y) => y.score - x.score)
}
