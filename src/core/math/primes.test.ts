import { describe, it, expect } from 'vitest'
import { isPrime, nthPrime, primeFactors, totient } from './primes'

describe('prime utilities', () => {
  it('tests primality', () => {
    expect(isPrime(1)).toBe(false)
    expect(isPrime(2)).toBe(true)
    expect(isPrime(109)).toBe(true)
    expect(isPrime(111)).toBe(false)
  })
  it('returns the nth prime (1-indexed)', () => {
    expect(nthPrime(1)).toBe(2)
    expect(nthPrime(29)).toBe(109)
  })
  it('factors integers', () => {
    expect(primeFactors(360)).toEqual([2, 2, 2, 3, 3, 5])
  })
  it("computes Euler's totient", () => {
    expect(totient(1)).toBe(1)
    expect(totient(9)).toBe(6)
    expect(totient(109)).toBe(108) // prime
  })
})
