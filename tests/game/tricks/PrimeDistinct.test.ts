import { describe, expect, it } from 'vitest';
import { Primes } from '../../../src/game/tricks/Primes';

describe('PrimeDistinct', () => {
    const trick = new Primes();

    it('succeeds when all faces are distinct primes', () => {
        expect(trick.evaluate([1, 2, 3, 5]).success).toBe(true);
        expect(trick.evaluate([2, 3, 5]).success).toBe(true);
        expect(trick.evaluate([1, 3]).success).toBe(true);
        expect(trick.evaluate([7, 11]).success).toBe(true);
    });

    it('fails when any face is not prime', () => {
        expect(trick.evaluate([1, 2, 4]).success).toBe(false);
        expect(trick.evaluate([2, 4, 6]).success).toBe(false);
    });

    it('fails when faces are not distinct', () => {
        expect(trick.evaluate([1, 2, 2, 5]).success).toBe(false);
        expect(trick.evaluate([3, 3]).success).toBe(false);
    });

    it('scores by count when successful', () => {
        expect(trick.evaluate([1, 2, 3, 5]).score).toBe(4);
        expect(trick.evaluate([2, 3, 5]).score).toBe(3);
        expect(trick.evaluate([1, 7]).score).toBe(2);
    });

    it('scores zero when not successful', () => {
        expect(trick.evaluate([1, 2, 4]).score).toBe(0);
        expect(trick.evaluate([1, 2, 2, 5]).score).toBe(0);
    });

    it('has correct metadata', () => {
        expect(trick.id).toBe('prime-distinct');
        expect(trick.name).toBe('Primes');
    });
});
