// Shapes for the Liber Primus corpus, normalized from the vendored cicada_tools section files.

export type SectionStatus = 'solved' | 'unsolved'

/** A transform descriptor as it appears in a cicada_tools section.json. */
export interface CtTransformer {
  type: string
  key?: string
  shift?: number
  add?: boolean
  interrupt_indices?: number[]
}

/** A raw cicada_tools section file. */
export interface CtSection {
  title: string
  transformers: CtTransformer[]
  pages: { filename: string; text: string }[]
}

/** A normalized corpus section as the app consumes it. */
export interface CorpusSection {
  /** stable id, e.g. "001_welcome" */
  id: string
  /** display order */
  index: number
  title: string
  status: SectionStatus
  /** human-readable description of the cipher chain (e.g. "Atbash → Shift 3") */
  method: string
  /** the runic ciphertext (heading-bracket annotations stripped) */
  cipherText: string
  pageCount: number
  /** decoded runic plaintext — solved sections only */
  plainText?: string
  /** transliterated plaintext — solved sections only */
  plainLatin?: string
}
