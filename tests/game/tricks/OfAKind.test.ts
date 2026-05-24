import { describe, expect, it } from 'vitest';
import { OfAKind } from '../../../src/game/tricks/OfAKind';
import { GLOBAL_MINIMUM_THRESHOLD } from '../../../src/game/tricks/constants';

describe('OfAKind', () => {
    const trick = new OfAKind();

    it('succeeds when at least MINIMUM_RUN_LENGTH faces match', () => {
        expect(trick.evaluate([2, 2, 2]).success).toBe(true);
        expect(trick.evaluate([5, 5, 5, 5]).success).toBe(true);
        expect(trick.evaluate([1, 1, 1]).success).toBe(true);
    });

    it('fails when fewer than MINIMUM_RUN_LENGTH faces match', () => {
        expect(trick.evaluate([2, 2]).success).toBe(false);
        expect(trick.evaluate([5]).success).toBe(false);
    });

    it('fails when faces do not all match', () => {
        expect(trick.evaluate([2, 2, 3]).success).toBe(false);
        expect(trick.evaluate([1, 2, 3]).success).toBe(false);
        expect(trick.evaluate([2, 2, 2, 5]).success).toBe(false);
    });

    it('scores by count when successful', () => {
        expect(trick.evaluate([2, 2, 2]).score).toBe(3);
        expect(trick.evaluate([5, 5, 5, 5]).score).toBe(4);
        expect(trick.evaluate([4, 4, 4, 4, 4]).score).toBe(5);
    });

    it('scores zero when not successful', () => {
        expect(trick.evaluate([2, 2, 3]).score).toBe(0);
        expect(trick.evaluate([1, 2, 3, 4]).score).toBe(0);
        expect(trick.evaluate([1, 1]).score).toBe(0);
    });

    it('has correct metadata', () => {
        expect(trick.id).toBe('of-a-kind');
        expect(trick.name).toBe('Of a Kind');
    });
});
