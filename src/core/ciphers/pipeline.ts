import { atbash } from './atbash'
import { shift } from './shift'
import { vigenereEncrypt, vigenereDecrypt } from './vigenere'
import { primeStreamShift, totientStreamShift } from './totient'
import { affineEncrypt, affineDecrypt, autokeyEncrypt, autokeyDecrypt } from './affine'

export type Stage = { op: string; params?: Record<string, unknown> }

function applyStage(text: string, stage: Stage): string {
  const p = stage.params ?? {}
  switch (stage.op) {
    case 'atbash':
      return atbash(text)
    case 'shift':
      return shift(text, Number(p.n ?? 0))
    case 'vigenere': {
      const key = String(p.key ?? '')
      const mode = (p.mode as 'add' | 'sub') ?? 'sub'
      return p.decrypt ? vigenereDecrypt(text, key, mode) : vigenereEncrypt(text, key, mode)
    }
    case 'prime':
      return primeStreamShift(text, (p.mode as 'add' | 'sub') ?? 'sub', Number(p.startN ?? 1))
    case 'totient':
      return totientStreamShift(text, (p.mode as 'add' | 'sub') ?? 'sub', Number(p.startN ?? 1))
    case 'affine': {
      const a = Number(p.a ?? 1)
      const b = Number(p.b ?? 0)
      return p.decrypt ? affineDecrypt(text, a, b) : affineEncrypt(text, a, b)
    }
    case 'autokey': {
      const primer = String(p.primer ?? '')
      return p.decrypt ? autokeyDecrypt(text, primer) : autokeyEncrypt(text, primer)
    }
    default:
      throw new Error(`runPipeline: unknown op "${stage.op}"`)
  }
}

export function runPipeline(text: string, stages: Stage[]) {
  const steps: { op: string; output: string }[] = []
  let current = text
  for (const stage of stages) {
    current = applyStage(current, stage)
    steps.push({ op: stage.op, output: current })
  }
  return { output: current, steps }
}
