import { describe, it, expect } from 'vitest'
import { CICADA_TIMELINE, CICADA_PGP_KEY_ID } from './history'

describe('Cicada timeline', () => {
  it('is non-empty and chronologically ordered', () => {
    expect(CICADA_TIMELINE.length).toBeGreaterThan(5)
    const dates = CICADA_TIMELINE.map((e) => e.date)
    expect([...dates]).toEqual([...dates].sort())
  })
  it('records the Liber Primus release and the PGP anchor', () => {
    expect(CICADA_TIMELINE.some((e) => e.category === 'release' && /Liber Primus/i.test(e.title))).toBe(true)
    expect(CICADA_PGP_KEY_ID).toBe('7A35090F')
  })
})
