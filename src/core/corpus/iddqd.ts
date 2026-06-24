// Pure parser for the rtkd/iddqd master transcription (the canonical verbatim Liber Primus).
// Delimiter grammar (declared in the file header):
//   word '-'  clause '.'  paragraph '&'  segment '$'  chapter '§'  line '/'  page '%'
// This is a pure string->data function: the renderer imports the .txt as a string (Vite ?raw)
// and tests read it from disk; neither path lives here.
import { runeToEntry } from '../gematria/gematria'

export interface IddqdPage {
  /** 0-based sequential page index in the master transcription. */
  index: number
  /** Verbatim rune+delimiter chunk for this page (header stripped, trimmed). */
  raw: string
  /** Number of actual runes on the page (delimiters excluded). */
  runeCount: number
}

const isRune = (ch: string): boolean => runeToEntry(ch) !== undefined

/** Strip the delimiter-legend header: real content starts at the first runic character. */
function stripHeader(raw: string): string {
  for (let i = 0; i < raw.length; i++) {
    if (isRune(raw[i])) return raw.slice(i)
  }
  return ''
}

function countRunes(s: string): number {
  let n = 0
  for (const ch of s) if (isRune(ch)) n++
  return n
}

/**
 * Parse the iddqd master transcription into pages split on the page delimiter '%'.
 * Chunks with no runes (structural-only separators) are dropped so `index` tracks real pages.
 */
export function parseIddqdMaster(raw: string): IddqdPage[] {
  const body = stripHeader(raw)
  const pages: IddqdPage[] = []
  for (const chunk of body.split('%')) {
    const trimmed = chunk.trim()
    const runeCount = countRunes(trimmed)
    if (runeCount === 0) continue
    pages.push({ index: pages.length, raw: trimmed, runeCount })
  }
  return pages
}

/** Total rune count across the whole corpus. */
export function totalRunes(pages: IddqdPage[]): number {
  return pages.reduce((sum, p) => sum + p.runeCount, 0)
}
