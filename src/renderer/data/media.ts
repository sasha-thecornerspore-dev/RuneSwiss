// Cicada 3301 / Liber Primus media, loaded by URL at runtime (so nothing bloats the bundle).
// All URLs verified resolvable (HTTP 200) by the media-discovery research. Sourced from community
// archives — see src/core/corpus/data/sources/ATTRIBUTION.md. Requires internet; offline degrades.

const IDDQD = 'https://raw.githubusercontent.com/rtkd/iddqd/master'

/** All 75 Liber Primus page scans (rtkd/iddqd FULL set, zero-padded 00.jpg … 74.jpg). */
export const PAGE_IMAGES: { page: number; url: string }[] = Array.from({ length: 75 }, (_, i) => ({
  page: i,
  url: `${IDDQD}/liber-primus__images--full/${String(i).padStart(2, '0')}.jpg`,
}))

export const AUDIO = {
  title: 'The Instar Emergence',
  subtitle: '2013 puzzle · 761.MP3 · the ID3 tag hides a "Parable" poem',
  url: `${IDDQD}/2013/02/761.MP3`,
}

const SCREAM = 'https://raw.githubusercontent.com/scream314/cicada3301/master/assets'
export const OPENING_IMAGES = [
  {
    year: '2012',
    url: `${SCREAM}/2012/1CcV1.jpg`,
    caption: '“Hello. We are looking for highly intelligent individuals. …a message is hidden in this image.”',
  },
  {
    year: '2013',
    url: `${SCREAM}/2013/gqvvmk.jpg`,
    caption: '“Hello again. Our search for intelligent individuals now continues.”',
  },
  {
    year: '2014',
    url: `${SCREAM}/2014/stage01/zN4h51m.jpg`,
    caption: '“Epiphany is upon you. Your pilgrimage has begun. Enlightenment awaits.”',
  },
]

const PGP_BASE = 'https://raw.githubusercontent.com/krisyotam/cicada3301/main/pgp/messages'
export const PGP_MESSAGES: { file: string; label: string }[] = [
  { file: '2012-01-book-code-poem.asc', label: '2012-01 · Book-code poem' },
  { file: '2012-01-coordinates.asc', label: '2012-01 · Coordinates' },
  { file: '2012-01-key-announcement.asc', label: '2012-01 · Key announcement' },
  { file: '2012-01-key-in-front-of-you.asc', label: '2012-01 · The key in front of you' },
  { file: '2012-01-second-chance.asc', label: '2012-01 · Second chance' },
  { file: '2012-01-end-of-puzzle.asc', label: '2012-01 · End of puzzle' },
  { file: '2012-01-final-message.asc', label: '2012-01 · Final message' },
  { file: '2013-01-opening-book-code.asc', label: '2013-01 · Opening book code' },
  { file: '2013-01-cicada-os-message.asc', label: '2013-01 · Cicada OS message' },
  { file: '2013-01-rune-table-morse.asc', label: '2013-01 · Rune table / Morse' },
  { file: '2013-01-telnet-hello.asc', label: '2013-01 · Telnet hello' },
  { file: '2014-01-opening-book-code.asc', label: '2014-01 · Opening book code' },
  { file: '2014-01-onion-welcome.asc', label: '2014-01 · Onion welcome' },
  { file: '2014-01-onion5-liber-primus.asc', label: '2014-01 · Onion 5 — Liber Primus' },
  { file: '2014-01-liber-primus-hash-block.asc', label: '2014-01 · Liber Primus hash block' },
  { file: '2014-01-final-message.asc', label: '2014-01 · Final message' },
  { file: '2014-05-liber-primus-release.asc', label: '2014-05 · Liber Primus release' },
  { file: '2015-07-planned-parenthood-denial.asc', label: '2015-07 · Planned Parenthood denial' },
  { file: '2017-04-final-message.asc', label: '2017-04 · Final message' },
  { file: '2017-04-final-warning.asc', label: '2017-04 · Final warning' },
]
export const pgpUrl = (file: string): string => `${PGP_BASE}/${file}`
