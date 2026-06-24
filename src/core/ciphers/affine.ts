import { mapRuneIndices, mod } from '../alphabet/ops'
import { ALPHABET_SIZE } from '../gematria/table'
import { runeToEntry } from '../gematria/gematria'

function modInverse(a: number, m: number): number {
  const a0 = mod(a, m)
  for (let x = 1; x < m; x++) if (mod(a0 * x, m) === 1) return x
  throw new Error(`affine: a=${a} is not invertible mod ${m}`)
}

export function affineEncrypt(text: string, a: number, b: number): string {
  modInverse(a, ALPHABET_SIZE) // validates coprimality (throws if not)
  return mapRuneIndices(text, (i) => a * i + b)
}

export function affineDecrypt(text: string, a: number, b: number): string {
  const aInv = modInverse(a, ALPHABET_SIZE)
  return mapRuneIndices(text, (i) => aInv * (i - b))
}

export function autokeyEncrypt(text: string, primer: string): string {
  const keyIdx: number[] = []
  for (const ch of primer) {
    const e = runeToEntry(ch)
    if (e) keyIdx.push(e.index)
  }
  let pos = 0
  return mapRuneIndices(text, (i) => {
    const k = keyIdx[pos] ?? 0
    keyIdx.push(i) // plaintext feeds the key stream
    pos += 1
    return i + k
  })
}

export function autokeyDecrypt(text: string, primer: string): string {
  const keyIdx: number[] = []
  for (const ch of primer) {
    const e = runeToEntry(ch)
    if (e) keyIdx.push(e.index)
  }
  let pos = 0
  return mapRuneIndices(text, (c) => {
    const k = keyIdx[pos] ?? 0
    const p = mod(c - k)
    keyIdx.push(p) // recovered plaintext feeds the key stream
    pos += 1
    return p
  })
}
