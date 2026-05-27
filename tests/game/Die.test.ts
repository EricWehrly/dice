import { describe, expect, it } from 'vitest';
import { Die } from '../../src/game/Die';

describe('Die', () => {
    it('rolls values within face range', () => {
        const die = new Die({ faceCount: 6 });

        for (let i = 0; i < 100; i += 1) {
            const value = die.roll();
            expect(value).toBeGreaterThanOrEqual(1);
            expect(value).toBeLessThanOrEqual(6);
        }
    });

    it('uses per-die randomizer for deterministic result', () => {
        const die = new Die({ faceCount: 6, randomizer: () => 0.9999 });

        const value = die.roll();
        expect(value).toBe(6);
    });

    it('respects provided id and name', () => {
        const die = new Die({ faceCount: 8, id: 'die-1', name: 'custom-d8' });

        expect(die.id).toBe('die-1');
        expect(die.faceCount).toBe(8);
        expect(die.name).toBe('custom-d8');
    });
});
