import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { describe, it, expect } from 'vitest'
import { parseIddqdMaster, totalRunes } from './iddqd'
import { atbash } from '../ciphers/atbash'
import { runesToLatin } from '../translit/translit'

const here = dirname(fileURLToPath(import.meta.url))
const MASTER = readFileSync(join(here, 'data/sources/iddqd-master.txt'), 'utf8')
const letters = (s: string) => runesToLatin(s).toUpperCase().replace(/[^A-Z]/g, '')

describe('parseIddqdMaster', () => {
  const pages = parseIddqdMaster(MASTER)

  it('splits the master into a plausible number of pages', () => {
    // the Liber Primus is ~70+ page-units; sanity bounds, not an exact count
    expect(pages.length).toBeGreaterThan(50)
    expect(pages.length).toBeLessThan(100)
  })

  it('captures a large verbatim rune corpus', () => {
    expect(totalRunes(pages)).toBeGreaterThan(9000)
  })

  it('assigns sequential 0-based indices', () => {
    pages.forEach((p, i) => expect(p.index).toBe(i))
  })

  it('page 0 is "A Warning" and Atbash-decodes correctly (parser <-> source cross-check)', () => {
    const out = letters(atbash(pages[0].raw))
    expect(out).toContain('BELIEUENOTHNGFROMTHISBOOC')
    expect(out.endsWith('FORALLISSACRED')).toBe(true)
  })
})
