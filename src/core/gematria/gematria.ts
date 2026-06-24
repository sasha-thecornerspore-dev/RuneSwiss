import { GEMATRIA, type RuneEntry } from './table'

const BY_RUNE = new Map<string, RuneEntry>(GEMATRIA.map((e) => [e.rune, e]))
const BY_LATIN = new Map<string, RuneEntry>()
for (const e of GEMATRIA) {
  BY_LATIN.set(e.latin.toUpperCase(), e)
  for (const a of e.alt) BY_LATIN.set(a.toUpperCase(), e)
}

export function runeToEntry(rune: string): RuneEntry | undefined {
  return BY_RUNE.get(rune)
}
export function latinToEntry(latin: string): RuneEntry | undefined {
  return BY_LATIN.get(latin.toUpperCase())
}
export function indexToEntry(i: number): RuneEntry | undefined {
  return GEMATRIA[i]
}
export function runeToValue(rune: string): number | undefined {
  return BY_RUNE.get(rune)?.prime
}
export function gematriaSum(runes: string): number {
  let sum = 0
  for (const ch of runes) sum += BY_RUNE.get(ch)?.prime ?? 0
  return sum
}
