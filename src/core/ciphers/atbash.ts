import { mapRuneIndices } from '../alphabet/ops'
import { ALPHABET_SIZE } from '../gematria/table'

export function atbash(text: string): string {
  return mapRuneIndices(text, (i) => ALPHABET_SIZE - 1 - i)
}
