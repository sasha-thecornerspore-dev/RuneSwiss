// Lightweight steganography helpers for the original Cicada image-puzzle stages. These are pure and
// operate on byte buffers (the renderer decodes images to RGBA pixel bytes before calling them).
// Note: OutGuess (the JPEG-DCT tool Cicada actually used) is not reimplemented here — it requires the
// external `outguess` binary; this provides the broadly-useful `strings` and LSB extraction.

/** Extract runs of printable ASCII (length ≥ minLen) from a byte buffer — the classic `strings`. */
export function extractStrings(bytes: Uint8Array, minLen = 4): string[] {
  const out: string[] = []
  let cur = ''
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]
    if (b >= 0x20 && b <= 0x7e) {
      cur += String.fromCharCode(b)
    } else {
      if (cur.length >= minLen) out.push(cur)
      cur = ''
    }
  }
  if (cur.length >= minLen) out.push(cur)
  return out
}

/**
 * Extract LSB-hidden bytes from a channel buffer (e.g. RGBA pixel bytes). Reads `bits` least-
 * significant bits from each byte (optionally skipping the alpha channel of RGBA data) and packs
 * them MSB-first into output bytes.
 */
export function extractLsb(
  data: Uint8Array,
  opts: { bits?: number; skipAlpha?: boolean } = {},
): Uint8Array {
  const bits = Math.min(Math.max(opts.bits ?? 1, 1), 8)
  const skipAlpha = opts.skipAlpha ?? true
  const mask = (1 << bits) - 1
  const out: number[] = []
  let acc = 0
  let nbits = 0
  for (let i = 0; i < data.length; i++) {
    if (skipAlpha && i % 4 === 3) continue
    acc = (acc << bits) | (data[i] & mask)
    nbits += bits
    while (nbits >= 8) {
      nbits -= 8
      out.push((acc >> nbits) & 0xff)
    }
  }
  return new Uint8Array(out)
}
