import { GEMATRIA } from '../gematria/table'
import { runeToEntry } from '../gematria/gematria'

export function runeCount(text: string): number {
  let n = 0
  for (const ch of text) if (runeToEntry(ch)) n++
  return n
}

export function frequencies(text: string) {
  const counts = new Array(GEMATRIA.length).fill(0)
  let total = 0
  for (const ch of text) {
    const e = runeToEntry(ch)
    if (e) {
      counts[e.index]++
      total++
    }
  }
  return GEMATRIA.map((e) => ({
    index: e.index,
    rune: e.rune,
    latin: e.latin,
    count: counts[e.index],
    proportion: total ? counts[e.index] / total : 0,
  }))
}
