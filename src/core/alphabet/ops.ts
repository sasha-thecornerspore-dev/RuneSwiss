import { runeToEntry, indexToEntry } from '../gematria/gematria'
import { ALPHABET_SIZE } from '../gematria/table'

export function mod(n: number, m: number = ALPHABET_SIZE): number {
  return ((n % m) + m) % m
}

export function runesToIndices(text: string): (number | null)[] {
  return [...text].map((ch) => runeToEntry(ch)?.index ?? null)
}

export function mapRuneIndices(
  text: string,
  fn: (index: number, runePos: number) => number,
): string {
  let out = ''
  let pos = 0
  for (const ch of text) {
    const entry = runeToEntry(ch)
    if (entry) {
      out += indexToEntry(mod(fn(entry.index, pos)))!.rune
      pos += 1
    } else {
      out += ch
    }
  }
  return out
}

export function indicesToRunes(idx: (number | null)[], original: string): string {
  const chars = [...original]
  return idx.map((i, k) => (i === null ? chars[k] : indexToEntry(mod(i))!.rune)).join('')
}
