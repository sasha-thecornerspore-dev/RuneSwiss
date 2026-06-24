import { runeToEntry } from '../gematria/gematria'
import { GEMATRIA } from '../gematria/table'

const SEPARATORS = new Set(['᛫', '᛬']) // runic word / section separators
const BRACKETS = new Set(['᚛', '᚜']) // runic punctuation brackets (dropped)

export function runesToLatin(text: string): string {
  let out = ''
  for (const ch of text) {
    const entry = runeToEntry(ch)
    if (entry) out += entry.latin
    else if (SEPARATORS.has(ch)) out += ' '
    else if (BRACKETS.has(ch)) continue
    else out += ch
  }
  return out
}

// All latin spellings (canonical + alt), longest first, so 'ING'/'TH' win over 'I'/'T'.
const LATIN_TOKENS: { latin: string; rune: string }[] = GEMATRIA
  .flatMap((e) => [e.latin, ...e.alt].map((l) => ({ latin: l.toUpperCase(), rune: e.rune })))
  .sort((a, b) => b.latin.length - a.latin.length)

export function latinToRunes(text: string): string {
  const s = text.toUpperCase()
  let out = ''
  let i = 0
  while (i < s.length) {
    if (s[i] === ' ') {
      out += '᛫'
      i += 1
      continue
    }
    const match = LATIN_TOKENS.find((t) => s.startsWith(t.latin, i))
    if (match) {
      out += match.rune
      i += match.latin.length
    } else {
      out += s[i]
      i += 1
    }
  }
  return out
}
