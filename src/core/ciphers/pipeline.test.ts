import { describe, it, expect } from 'vitest'
import { runPipeline } from './pipeline'
import { atbash } from './atbash'
import { shift } from './shift'

describe('runPipeline', () => {
  it('applies stages left to right and records steps', () => {
    const text = 'ᚠᚢᚦᚩ'
    const { output, steps } = runPipeline(text, [
      { op: 'atbash' },
      { op: 'shift', params: { n: 3 } },
    ])
    expect(output).toBe(shift(atbash(text), 3))
    expect(steps.map((s) => s.op)).toEqual(['atbash', 'shift'])
    expect(steps[0].output).toBe(atbash(text))
  })
  it('throws on unknown op', () => {
    expect(() => runPipeline('ᚠ', [{ op: 'nope' }])).toThrow(/unknown op/i)
  })
})
