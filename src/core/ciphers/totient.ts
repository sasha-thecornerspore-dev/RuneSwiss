import { mapRuneIndices } from '../alphabet/ops'
import { nthPrime, totient } from '../math/primes'

export function primeStreamShift(text: string, mode: 'add' | 'sub' = 'sub', startN = 1): string {
  const sign = mode === 'add' ? 1 : -1
  return mapRuneIndices(text, (i, pos) => i + sign * nthPrime(startN + pos))
}

export function totientStreamShift(text: string, mode: 'add' | 'sub' = 'sub', startN = 1): string {
  const sign = mode === 'add' ? 1 : -1
  return mapRuneIndices(text, (i, pos) => i + sign * totient(nthPrime(startN + pos)))
}
