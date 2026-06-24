import { mapRuneIndices, mod } from '../alphabet/ops'
import { runeToEntry, indexToEntry } from '../gematria/gematria'
import { latinToRunes } from '../translit/translit'

export function keyToIndices(key: string): number[] {
  // If the key already contains runes, use them; otherwise treat as latin and convert.
  const hasRunes = [...key].some((ch) => runeToEntry(ch))
  const runes = hasRunes ? key : latinToRunes(key)
  const idx: number[] = []
  for (const ch of runes) {
    const e = runeToEntry(ch)
    if (e) idx.push(e.index)
  }
  if (idx.length === 0) throw new Error(`vigenere: key "${key}" has no usable runes`)
  return idx
}

export function vigenereEncrypt(text: string, key: string, mode: 'add' | 'sub' = 'sub'): string {
  const k = keyToIndices(key)
  const sign = mode === 'add' ? 1 : -1
  return mapRuneIndices(text, (i, pos) => i + sign * k[pos % k.length])
}

export function vigenereDecrypt(text: string, key: string, mode: 'add' | 'sub' = 'sub'): string {
  return vigenereEncrypt(text, key, mode === 'add' ? 'sub' : 'add')
}

export interface InterruptOptions {
  /** 'add' = index + key, 'sub' = index - key (the Liber Primus solves use 'sub'). Default 'sub'. */
  mode?: 'add' | 'sub'
  /** Rune positions (counting runes only, from 0) treated as interrupts. */
  interruptIndices?: number[]
  /** If true, drop interrupt runes from the output; if false (default) pass them through unchanged. */
  dropInterrupts?: boolean
}

/**
 * Interrupt-aware Vigenère / running-key — the form the Liber Primus actually uses.
 * At each interrupt position the rune is NOT enciphered and the running key does NOT advance
 * (in the LP these are ᚠ runes that survive into the plaintext, e.g. the "F" in "OF").
 */
export function vigenereInterrupt(text: string, key: string, opts: InterruptOptions = {}): string {
  const k = keyToIndices(key)
  const sign = opts.mode === 'add' ? 1 : -1
  const interrupts = new Set(opts.interruptIndices ?? [])
  const drop = opts.dropInterrupts ?? false
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
      if (!drop) out += ch
      runePos += 1
      continue
    }
    out += indexToEntry(mod(e.index + sign * k[keyPos % k.length]))!.rune
    keyPos += 1
    runePos += 1
  }
  return out
}
