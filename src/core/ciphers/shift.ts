import { mapRuneIndices } from '../alphabet/ops'

export function shift(text: string, n: number): string {
  return mapRuneIndices(text, (i) => i + n)
}
export function unshift(text: string, n: number): string {
  return shift(text, -n)
}
