// Cicada 3301 timeline for the History & Reference panel. Cross-verified across Wikipedia,
// the Bibliotheca Anonoma wiki, Uncovering Cicada, Boxentriq, and the dated PGP .asc archive.
// The single authentication anchor for every genuine Cicada message is OpenPGP key 7A35090F.

export type HistoryCategory = 'puzzle' | 'release' | 'message' | 'milestone'

export interface HistoryEvent {
  /** ISO date or YYYY-MM where the day is uncertain. */
  date: string
  title: string
  detail: string
  category: HistoryCategory
}

export const CICADA_PGP_KEY_ID = '7A35090F'

export const CICADA_TIMELINE: readonly HistoryEvent[] = [
  {
    date: '2012-01-04',
    title: 'The first puzzle appears',
    detail:
      'A black-and-white image is posted to 4chan /x/: "Hello. We are looking for highly intelligent individuals." OutGuess steganography hidden in the image starts the trail.',
    category: 'puzzle',
  },
  {
    date: '2012-01-09',
    title: 'Coordinates across the world',
    detail:
      'A countdown resolves to 14 GPS coordinates in five countries. Physical posters bearing QR codes are found taped to poles, continuing the puzzle through Tor.',
    category: 'milestone',
  },
  {
    date: '2012-02',
    title: 'First puzzle concludes',
    detail:
      'After roughly a month the 2012 puzzle ends; a small number of solvers reach the final stage and are contacted privately.',
    category: 'milestone',
  },
  {
    date: '2013-01-04',
    title: 'The second puzzle',
    detail:
      'A new puzzle includes a bootable "Cicada" Linux image, the audio track "The Instar Emergence", a runic table, Morse code, and a telnet stage. Solved by Marcus Wanner.',
    category: 'puzzle',
  },
  {
    date: '2014-01-04',
    title: 'The third puzzle begins',
    detail:
      'Announced via the Cicada Twitter account. The trail runs image → OutGuess → OpenPGP verification → book cipher → Tor onion pages, and introduces the Liber Primus.',
    category: 'puzzle',
  },
  {
    date: '2014-05-02',
    title: 'The Liber Primus is released',
    detail:
      'The full "First Book" — an entire text in Anglo-Saxon runes using the 29-rune Gematria Primus — is published. Greeting: "Hello. Your enlightenment awaits you."',
    category: 'release',
  },
  {
    date: '2015-07',
    title: 'Planned Parenthood denial',
    detail:
      'A PGP-signed message disavows a hack attributed to Cicada — an early example of the group using signatures to deny impersonation.',
    category: 'message',
  },
  {
    date: '2016-01-05',
    title: 'Disputed Twitter clue',
    detail:
      'An unsigned Twitter message circulates and is widely treated as an impostor, since it lacks a valid OpenPGP signature.',
    category: 'message',
  },
  {
    date: '2017-04',
    title: 'The last verified message',
    detail:
      'The final OpenPGP-signed Cicada message warns: "Beware false paths. Always verify PGP signature." No authenticated puzzle has appeared since.',
    category: 'message',
  },
  {
    date: '2026',
    title: 'The Liber Primus remains largely unsolved',
    detail:
      'The 2012 and 2013 puzzles were fully solved. Of the Liber Primus, an early run of pages was decoded via the Gematria Primus; the bulk of the book is still unsolved.',
    category: 'milestone',
  },
]
