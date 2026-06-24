import { applyTransformers } from './transforms'
import { runesToLatin } from '../translit/translit'
import type { CtSection, CorpusSection } from './types'

const stripBrackets = (s: string): string => s.replace(/[<>]/g, '')

/** Humanize a section id like "008_spirals" into "Spirals" for sections without a title. */
function titleFromId(id: string): string {
  return id
    .replace(/^\d+[_-]?/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

/** Normalize one raw cicada_tools section into a CorpusSection (decoding it if solved). */
export function buildSection(id: string, index: number, raw: CtSection): CorpusSection {
  const cipherText = stripBrackets(raw.pages.map((p) => p.text).join('\n'))
  const { output, solved, method } = applyTransformers(cipherText, raw.transformers)
  const section: CorpusSection = {
    id,
    index,
    title: raw.title?.trim() || titleFromId(id),
    status: solved ? 'solved' : 'unsolved',
    method,
    cipherText,
    pageCount: raw.pages.length,
  }
  if (solved) {
    section.plainText = output
    section.plainLatin = runesToLatin(output)
  }
  return section
}

/** Build the full corpus from id-sorted raw sections. */
export function buildCorpus(sections: { id: string; data: CtSection }[]): CorpusSection[] {
  return [...sections]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((s, i) => buildSection(s.id, i, s.data))
}
