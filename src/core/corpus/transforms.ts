// Map a cicada_tools transform chain onto the RuneSwiss engine to decode a section.
// Confirmed against the genuine ciphertext (see corpus.test.ts):
//   Atbash | Shift (forward by `shift`) | Vigenère (subtract key, with ᚠ-interrupts)
//   | TotientPrime (φ(prime) stream, add=false → subtract, with interrupts) | direct gematria.
import { atbash } from '../ciphers/atbash'
import { shift } from '../ciphers/shift'
import { vigenereInterrupt } from '../ciphers/vigenere'
import { totientPrimeInterrupt } from '../ciphers/totient'
import type { CtTransformer } from './types'

export interface ApplyResult {
  output: string
  solved: boolean
  method: string
}

export function applyTransformers(text: string, transformers: CtTransformer[]): ApplyResult {
  if (transformers.length === 0) {
    return { output: text, solved: true, method: 'Direct Gematria' }
  }
  let cur = text
  const steps: string[] = []
  for (const t of transformers) {
    switch (t.type) {
      case 'UnsolvedTransformer':
        return { output: text, solved: false, method: 'Unsolved' }
      case 'AtbashTransformer':
        cur = atbash(cur)
        steps.push('Atbash')
        break
      case 'ShiftTransformer':
        cur = shift(cur, t.shift ?? 0)
        steps.push(`Shift ${t.shift ?? 0}`)
        break
      case 'VigenereTransformer':
        cur = vigenereInterrupt(cur, t.key ?? '', {
          mode: 'sub',
          interruptIndices: t.interrupt_indices,
        })
        steps.push(`Vigenère (key ${t.key ?? ''})`)
        break
      case 'TotientPrimeTransformer':
        cur = totientPrimeInterrupt(cur, {
          mode: t.add ? 'add' : 'sub',
          interruptIndices: t.interrupt_indices,
        })
        steps.push('Totient-prime stream')
        break
      default:
        return { output: text, solved: false, method: `Unknown (${t.type})` }
    }
  }
  return { output: cur, solved: true, method: steps.join(' → ') }
}
