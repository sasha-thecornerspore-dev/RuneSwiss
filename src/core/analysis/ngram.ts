import { runeToEntry } from '../gematria/gematria'
import { latinToRunes } from '../translit/translit'

function onlyRunes(text: string): string {
  let out = ''
  for (const ch of text) if (runeToEntry(ch)) out += ch
  return out
}

export function findNgram(text: string, needle: string): number[] {
  const hay = onlyRunes(text)
  const hasRunes = [...needle].some((ch) => runeToEntry(ch))
  const pat = onlyRunes(hasRunes ? needle : latinToRunes(needle))
  if (!pat) return []
  const positions: number[] = []
  for (let i = 0; i + pat.length <= hay.length; i++) {
    if (hay.startsWith(pat, i)) positions.push(i)
  }
  return positions
}
