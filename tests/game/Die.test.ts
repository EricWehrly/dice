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

    it('applies material-prefixed name during constructor initialization', () => {
        const die = new Die({ faceCount: 6, bodyMaterial: 'gold' });

        expect(die.name).toBe('gold d6');
    });

    it('uses plastic-prefixed name by default', () => {
        const die = new Die({ faceCount: 6 });

        expect(die.name).toBe('plastic d6');
    });

    it('keeps explicit constructor name when material is provided', () => {
        const die = new Die({ faceCount: 6, name: 'lucky', bodyMaterial: 'gold' });

        expect(die.name).toBe('lucky');
    });

    it('initializes readonly state fields from constructor options', () => {
        const die = new Die({
            faceCount: 6,
            faceUp: 4,
            active: false,
            locked: true,
            edgeRoundness: 0.22,
        });

        expect(die.faceUp).toBe(4);
        expect(die.active).toBe(false);
        expect(die.locked).toBe(true);
        expect(die.edgeRoundness).toBeCloseTo(0.22, 6);
    });
});
