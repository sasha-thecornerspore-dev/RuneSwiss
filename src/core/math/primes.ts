export function isPrime(n: number): boolean {
  if (n < 2) return false
  if (n % 2 === 0) return n === 2
  for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false
  return true
}

export function primesUpTo(limit: number): number[] {
  const out: number[] = []
  for (let n = 2; n <= limit; n++) if (isPrime(n)) out.push(n)
  return out
}

export function nthPrime(n: number): number {
  if (n < 1) throw new Error('nthPrime is 1-indexed')
  let count = 0
  let candidate = 1
  while (count < n) {
    candidate++
    if (isPrime(candidate)) count++
  }
  return candidate
}

export function primeFactors(n: number): number[] {
  const out: number[] = []
  let m = Math.abs(n)
  for (let d = 2; d * d <= m; d++) while (m % d === 0) { out.push(d); m /= d }
  if (m > 1) out.push(m)
  return out
}

export function totient(n: number): number {
  if (n < 1) return 0
  let result = n
  let m = n
  for (let p = 2; p * p <= m; p++) {
    if (m % p === 0) {
      while (m % p === 0) m /= p
      result -= result / p
    }
  }
  if (m > 1) result -= result / m
  return Math.round(result)
}
