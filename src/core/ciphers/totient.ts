import { mapRuneIndices, mod } from '../alphabet/ops'
import { runeToEntry, indexToEntry } from '../gematria/gematria'
import { nthPrime, totient } from '../math/primes'

export function primeStreamShift(text: string, mode: 'add' | 'sub' = 'sub', startN = 1): string {
  const sign = mode === 'add' ? 1 : -1
  return mapRuneIndices(text, (i, pos) => i + sign * nthPrime(startN + pos))
}

export function totientStreamShift(text: string, mode: 'add' | 'sub' = 'sub', startN = 1): string {
  const sign = mode === 'add' ? 1 : -1
  return mapRuneIndices(text, (i, pos) => i + sign * totient(nthPrime(startN + pos)))
}

export interface StreamInterruptOptions {
  mode?: 'add' | 'sub'
  interruptIndices?: number[]
  startN?: number
}

/**
 * Interrupt-aware totient-of-prime stream — the Liber Primus "An End" cipher.
 * Position p is shifted by φ(nthPrime(startN + keyPos)); interrupt runes pass through and
 * do not advance the key. The LP solve uses subtraction (`mode: 'sub'`).
 */
export function totientPrimeInterrupt(text: string, opts: StreamInterruptOptions = {}): string {
  const sign = opts.mode === 'add' ? 1 : -1
  const startN = opts.startN ?? 1
  const interrupts = new Set(opts.interruptIndices ?? [])
  let out = ''
  let runePos = 0
  let keyPos = 0
  for (const ch of text) {
    const e = runeToEntry(ch)
    if (!e) {
      out += ch
      continue
    }
    if (interrupts.has(runePos)) {
      out += ch
      runePos += 1
      continue
    }
    out += indexToEntry(mod(e.index + sign * totient(nthPrime(startN + keyPos))))!.rune
    keyPos += 1
    runePos += 1
  }
  return out
}
