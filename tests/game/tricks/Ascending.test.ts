import { describe, expect, it } from 'vitest';
import { Ascending } from '../../../src/game/tricks/Ascending';
import { GLOBAL_MINIMUM_THRESHOLD } from '../../../src/game/tricks/constants';

describe('Ascending', () => {
    const trick = new Ascending();

    it('requires at least GLOBAL_MINIMUM_THRESHOLD dice in input', () => {
        expect(trick.evaluate([1, 2]).success).toBe(false);
        expect(trick.evaluate([1, 3, 5]).success).toBe(false);
    });

    it('succeeds when ALL dice form a consecutive run of at least GLOBAL_MINIMUM_THRESHOLD', () => {
        expect(trick.evaluate([1, 2, 3]).success).toBe(true);
        expect(trick.evaluate([2, 3, 4, 5]).success).toBe(true);
        expect(trick.evaluate([3, 4, 5, 6, 7]).success).toBe(true);
    });

    it('fails when no run reaches GLOBAL_MINIMUM_THRESHOLD', () => {
        expect(trick.evaluate([1, 1, 1]).success).toBe(false);
    });

    it('scores correctly when all dice participate', () => {
        expect(trick.evaluate([1, 2, 3]).score).toBe(3);
        expect(trick.evaluate([2, 3, 4, 5]).score).toBe(4);
        expect(trick.evaluate([5, 6, 7]).score).toBe(3);
    });

    it('fails when not all dice participate in the sequence', () => {
        expect(trick.evaluate([1, 2, 3, 5]).success).toBe(false);
        expect(trick.evaluate([1, 2, 3, 5, 6]).success).toBe(false);
        expect(trick.evaluate([1, 1, 2, 3]).success).toBe(false);
    });

    it('scores zero when not all dice participate', () => {
        expect(trick.evaluate([1, 2, 3, 5]).score).toBe(0);
        expect(trick.evaluate([1, 1, 2, 3]).score).toBe(0);
    });

    it('has correct metadata', () => {
        expect(trick.id).toBe('ascending');
        expect(trick.name).toBe('Ascending');
    });
});
