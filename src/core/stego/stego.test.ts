import { describe, it, expect } from 'vitest'
import { extractStrings, extractLsb } from './stego'

describe('extractStrings', () => {
  it('pulls printable runs of at least minLen and drops short ones', () => {
    const bytes = new Uint8Array([0, 1, 72, 69, 76, 76, 79, 0, 65, 66, 0, 51, 51, 48, 49])
    // "HELLO" (5), "AB" (2, dropped at minLen 4), "3301" (4)
    expect(extractStrings(bytes, 4)).toEqual(['HELLO', '3301'])
  })
})

describe('extractLsb', () => {
  it('recovers a message hidden in the least-significant bits (1 bit/byte)', () => {
    const msg = 'HI'
    const bitstream: number[] = []
    for (const ch of msg) for (let b = 7; b >= 0; b--) bitstream.push((ch.charCodeAt(0) >> b) & 1)
    const data = new Uint8Array(bitstream.map((bit) => 0xfe | bit)) // each byte's LSB carries one bit
    const out = extractLsb(data, { skipAlpha: false })
    expect(String.fromCharCode(...out)).toBe('HI')
  })

  it('skips the alpha channel of RGBA data by default', () => {
    // 8 message bits across RGB channels (alpha bytes carry junk and must be ignored)
    const msg = [0, 1, 0, 0, 0, 0, 0, 1] // 0x41 = "A"
    const data: number[] = []
    let mi = 0
    for (let px = 0; px < 4; px++) {
      for (let c = 0; c < 4; c++) {
        if (c === 3) data.push(0xff) // alpha junk
        else data.push(0xfe | (msg[mi++] ?? 0))
      }
    }
    const out = extractLsb(new Uint8Array(data))
    expect(out[0]).toBe(0x41)
  })
})
