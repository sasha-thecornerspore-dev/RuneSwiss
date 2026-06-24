// Loads the bundled corpus for the renderer via Vite. The cicada_tools section JSONs and the
// verbatim iddqd transcription are imported at build time (no runtime fs), then normalized by
// the pure engine functions.
import { buildCorpus, parseIddqdMaster, type CtSection, type CorpusSection } from '../../core/corpus'
import iddqdRaw from '../../core/corpus/data/sources/iddqd-master.txt?raw'

const files = import.meta.glob('../../core/corpus/data/sources/cicada_tools/*.json', {
  eager: true,
}) as Record<string, { default: CtSection }>

const sections = Object.entries(files).map(([path, mod]) => ({
  id: path.split('/').pop()!.replace(/\.json$/, ''),
  data: mod.default,
}))

export const CORPUS: CorpusSection[] = buildCorpus(sections)
export const IDDQD_PAGES = parseIddqdMaster(iddqdRaw)
