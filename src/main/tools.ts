// Tools the AI assistant can call to actually run the engine (instead of guessing). Each executes
// against the pure core and returns a compact string result. Runic text is provided by the model
// (it has the active page from the workspace context).
import {
  runesToLatin,
  gematriaSum,
  runPipeline,
  indexOfCoincidence,
  kasiskiCandidates,
  friedmanKeyLength,
  frequencies,
  runeCount,
  bruteShift,
  bruteAffine,
  vigenereKeyLengthScores,
  solveVigenereColumns,
  hillClimbVigenere,
  type Stage,
} from '../core'

export interface ToolDef {
  name: string
  description: string
  input_schema: { type: 'object'; properties: Record<string, unknown>; required?: string[] }
}

export const TOOLS: ToolDef[] = [
  {
    name: 'transliterate',
    description: 'Transliterate Elder Futhark runes to Latin via the Gematria Primus.',
    input_schema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
  },
  {
    name: 'gematria_sum',
    description: 'Sum the Gematria Primus prime values of all runes in the text.',
    input_schema: { type: 'object', properties: { runes: { type: 'string' } }, required: ['runes'] },
  },
  {
    name: 'run_cipher',
    description:
      'Apply a pipeline of transforms to runic text. stages is an array of {op, params}. ops: atbash; shift{n}; vigenere{key,mode:"add"|"sub",decrypt,interruptIndices:number[]}; prime{mode,startN}; totient{mode,startN}; affine{a,b,decrypt}; autokey{primer,decrypt}. Returns decoded runes and transliteration.',
    input_schema: {
      type: 'object',
      properties: { text: { type: 'string' }, stages: { type: 'array', items: { type: 'object' } } },
      required: ['text', 'stages'],
    },
  },
  {
    name: 'analyze',
    description:
      'Statistics on runic text: rune count, Index of Coincidence, Friedman key-length estimate, Kasiski key-length candidates, and top rune frequencies.',
    input_schema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
  },
  {
    name: 'brute_shift',
    description: 'Try every shift, ranked by English fitness. Returns the top 5.',
    input_schema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
  },
  {
    name: 'brute_affine',
    description: 'Try every affine (a,b), ranked by English fitness. Returns the top 5.',
    input_schema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
  },
  {
    name: 'vigenere_keylength',
    description: 'Rank likely Vigenère key lengths by average per-column Index of Coincidence.',
    input_schema: {
      type: 'object',
      properties: { text: { type: 'string' }, maxLen: { type: 'number' } },
      required: ['text'],
    },
  },
  {
    name: 'vigenere_solve',
    description:
      'Recover a Vigenère key of the given length (column solve + hill-climb) and decrypt (LP subtract convention). Returns the key and a plaintext preview.',
    input_schema: {
      type: 'object',
      properties: { text: { type: 'string' }, keyLength: { type: 'number' } },
      required: ['text', 'keyLength'],
    },
  },
]

export function runTool(name: string, input: Record<string, unknown>): string {
  try {
    const text = String(input.text ?? '')
    switch (name) {
      case 'transliterate':
        return runesToLatin(text)
      case 'gematria_sum':
        return String(gematriaSum(String(input.runes ?? '')))
      case 'run_cipher': {
        const out = runPipeline(text, (input.stages as Stage[]) ?? []).output
        return JSON.stringify({ runes: out, latin: runesToLatin(out) })
      }
      case 'analyze': {
        const top = frequencies(text)
          .filter((f) => f.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, 8)
          .map((f) => `${f.latin}:${f.count}`)
        return JSON.stringify({
          runes: runeCount(text),
          ioc: +indexOfCoincidence(text).toFixed(4),
          friedman: +friedmanKeyLength(text).toFixed(2),
          kasiski: kasiskiCandidates(text).slice(0, 6).map((c) => c.keyLength),
          topFrequencies: top,
        })
      }
      case 'brute_shift':
        return JSON.stringify(
          bruteShift(text).slice(0, 5).map((r) => ({ n: r.params.n, score: +r.score.toFixed(1), preview: r.latin.slice(0, 60) })),
        )
      case 'brute_affine':
        return JSON.stringify(
          bruteAffine(text).slice(0, 5).map((r) => ({ a: r.params.a, b: r.params.b, score: +r.score.toFixed(1), preview: r.latin.slice(0, 60) })),
        )
      case 'vigenere_keylength':
        return JSON.stringify(
          vigenereKeyLengthScores(text, Number(input.maxLen) || 20)
            .slice(0, 8)
            .map((s) => ({ keyLength: s.keyLength, ioc: +s.ioc.toFixed(4) })),
        )
      case 'vigenere_solve': {
        const kl = Number(input.keyLength) || 1
        const col = solveVigenereColumns(text, kl)
        const hc = hillClimbVigenere(text, kl, 3000)
        const best = hc.score >= col.score ? hc : col
        return JSON.stringify({ key: best.keyLatin || best.keyRunes, score: +best.score.toFixed(1), preview: best.latin.slice(0, 140) })
      }
      default:
        return `unknown tool: ${name}`
    }
  } catch (e) {
    return `error: ${e instanceof Error ? e.message : String(e)}`
  }
}
