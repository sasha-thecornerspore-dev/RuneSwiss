import { runeToEntry } from '../gematria/gematria'
import { indexOfCoincidence } from './ioc'
import { ALPHABET_SIZE } from '../gematria/table'

function onlyRunes(text: string): string {
  let out = ''
  for (const ch of text) if (runeToEntry(ch)) out += ch
  return out
}

function factorsOf(n: number): number[] {
  const f: number[] = []
  for (let d = 2; d <= n; d++) if (n % d === 0) f.push(d)
  return f
}

export function kasiskiCandidates(text: string, minGram = 3) {
  const s = onlyRunes(text)
  const seen = new Map<string, number[]>() // gram -> positions
  for (let i = 0; i + minGram <= s.length; i++) {
    const g = s.slice(i, i + minGram)
    const arr = seen.get(g) ?? []
    arr.push(i)
    seen.set(g, arr)
  }
  const factorScore = new Map<number, number>()
  for (const positions of seen.values()) {
    if (positions.length < 2) continue
    for (let k = 1; k < positions.length; k++) {
      const spacing = positions[k] - positions[0]
      for (const f of factorsOf(spacing)) {
        if (f < 2 || f > 40) continue
        factorScore.set(f, (factorScore.get(f) ?? 0) + 1)
      }
    }
  }
  return [...factorScore.entries()]
    .map(([keyLength, score]) => ({ keyLength, score }))
    .sort((a, b) => b.score - a.score)
}

export function friedmanKeyLength(text: string): number {
  const s = onlyRunes(text)
  const n = s.length
  const ic = indexOfCoincidence(s)
  const kappaR = 1 / ALPHABET_SIZE // random IoC for 29-letter alphabet
  const kappaP = 0.0667 // approx natural-language IoC
  const denom = (n - 1) * ic - kappaR * n + kappaP
  if (denom <= 0) return 0
  return ((kappaP - kappaR) * n) / denom
}
