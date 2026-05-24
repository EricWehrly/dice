import { Trick, type TrickResult } from './Trick';

/**
 * Prime Distinct: All faces show distinct prime numbers.
 * Score: Number of distinct primes if successful.
 */
export class Primes extends Trick {
  id = 'prime-distinct' as const;
  name = 'Primes';

  // TODO: support N-sided die, and/or check/warn when die can roll higher than these
  private primes = new Set([1, 2, 3, 5, 7, 11, 13]);

  evaluate(faces: number[]): TrickResult {
    const success = this.isPrimeDistinct(faces);
    return {
      success,
      score: success ? faces.length : 0,
    };
  }

  private isPrimeDistinct(faces: number[]): boolean {
    if (faces.length === 0) {
      return false;
    }

    const distinct = new Set(faces);
    if (distinct.size !== faces.length) {
      return false;
    }

    return faces.every((f) => this.primes.has(f));
  }
}
