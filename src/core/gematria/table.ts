export interface RuneEntry {
  index: number
  rune: string
  latin: string
  alt: string[]
  prime: number
}

export const ALPHABET_SIZE = 29

// Gematria Primus: 29 Anglo-Saxon futhorc runes ↔ Latin ↔ first 29 primes.
// `latin` is the canonical transliteration; `alt` lists accepted alternates.
// Glyph/codepoint accuracy is additionally cross-checked in Plan 2 via
// solved-page round-trip tests.
export const GEMATRIA: readonly RuneEntry[] = [
  { index: 0,  rune: 'ᚠ', latin: 'F',  alt: [],        prime: 2 },
  { index: 1,  rune: 'ᚢ', latin: 'U',  alt: ['V'],     prime: 3 },
  { index: 2,  rune: 'ᚦ', latin: 'TH', alt: ['Þ'],     prime: 5 },
  { index: 3,  rune: 'ᚩ', latin: 'O',  alt: [],        prime: 7 },
  { index: 4,  rune: 'ᚱ', latin: 'R',  alt: [],        prime: 11 },
  { index: 5,  rune: 'ᚳ', latin: 'C',  alt: ['K'],     prime: 13 },
  { index: 6,  rune: 'ᚷ', latin: 'G',  alt: [],        prime: 17 },
  { index: 7,  rune: 'ᚹ', latin: 'W',  alt: [],        prime: 19 },
  { index: 8,  rune: 'ᚻ', latin: 'H',  alt: [],        prime: 23 },
  { index: 9,  rune: 'ᚾ', latin: 'N',  alt: [],        prime: 29 },
  { index: 10, rune: 'ᛁ', latin: 'I',  alt: [],        prime: 31 },
  { index: 11, rune: 'ᛄ', latin: 'J',  alt: [],        prime: 37 },
  { index: 12, rune: 'ᛇ', latin: 'EO', alt: [],        prime: 41 },
  { index: 13, rune: 'ᛈ', latin: 'P',  alt: [],        prime: 43 },
  { index: 14, rune: 'ᛉ', latin: 'X',  alt: [],        prime: 47 },
  { index: 15, rune: 'ᛋ', latin: 'S',  alt: ['Z'],     prime: 53 },
  { index: 16, rune: 'ᛏ', latin: 'T',  alt: [],        prime: 59 },
  { index: 17, rune: 'ᛒ', latin: 'B',  alt: [],        prime: 61 },
  { index: 18, rune: 'ᛖ', latin: 'E',  alt: [],        prime: 67 },
  { index: 19, rune: 'ᛗ', latin: 'M',  alt: [],        prime: 71 },
  { index: 20, rune: 'ᛚ', latin: 'L',  alt: [],        prime: 73 },
  { index: 21, rune: 'ᛝ', latin: 'NG', alt: ['ING'],   prime: 79 },
  { index: 22, rune: 'ᛟ', latin: 'OE', alt: [],        prime: 83 },
  { index: 23, rune: 'ᛞ', latin: 'D',  alt: [],        prime: 89 },
  { index: 24, rune: 'ᚪ', latin: 'A',  alt: [],        prime: 97 },
  { index: 25, rune: 'ᚫ', latin: 'AE', alt: ['Æ'],     prime: 101 },
  { index: 26, rune: 'ᚣ', latin: 'Y',  alt: [],        prime: 103 },
  { index: 27, rune: 'ᛡ', latin: 'IA', alt: ['IO'],    prime: 107 },
  { index: 28, rune: 'ᛠ', latin: 'EA', alt: [],        prime: 109 },
]
