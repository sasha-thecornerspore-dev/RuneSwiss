import { GEMATRIA } from '../gematria/table'
import { runeToEntry } from '../gematria/gematria'

export function indexOfCoincidence(text: string): number {
  const counts = new Array(GEMATRIA.length).fill(0)
  let n = 0
  for (const ch of text) {
    const e = runeToEntry(ch)
    if (e) {
      counts[e.index]++
      n++
    }
  }
  if (n < 2) return 0
  let sum = 0
  for (const c of counts) sum += c * (c - 1)
  return sum / (n * (n - 1))
}
