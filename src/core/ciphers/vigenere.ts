import { mapRuneIndices } from '../alphabet/ops'
import { runeToEntry } from '../gematria/gematria'
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
