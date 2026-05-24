import { describe, expect, it } from 'vitest';
import { InARow } from '../../../src/game/tricks/InARow';

describe('InARow', () => {
    const trick = new InARow();

    it('succeeds when there are at least 3 matching faces contiguously', () => {
        expect(trick.evaluate([2, 2, 2]).success).toBe(true);
        expect(trick.evaluate([1, 4, 4, 4, 2]).success).toBe(true);
    });

    it('fails when matching values are not contiguous', () => {
        expect(trick.evaluate([2, 1, 2, 2]).success).toBe(false);
        expect(trick.evaluate([3, 1, 3, 1, 3]).success).toBe(false);
    });

    it('fails when longest contiguous streak is below threshold', () => {
        expect(trick.evaluate([5, 5]).success).toBe(false);
        expect(trick.evaluate([1, 1, 2, 2, 3, 3]).success).toBe(false);
    });

    it('scores by longest contiguous streak when successful', () => {
        expect(trick.evaluate([2, 2, 2]).score).toBe(3);
        expect(trick.evaluate([6, 6, 6, 6, 1]).score).toBe(4);
    });

    it('scores zero when not successful', () => {
        expect(trick.evaluate([2, 1, 2, 2]).score).toBe(0);
        expect(trick.evaluate([1, 1]).score).toBe(0);
    });

    it('has correct metadata', () => {
        expect(trick.id).toBe('in-a-row');
        expect(trick.name).toBe('In a Row');
    });
});