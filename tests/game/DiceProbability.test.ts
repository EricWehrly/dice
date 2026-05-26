import { describe, expect, it } from 'vitest';
import { getFaceChances } from '../../src/game/DiceProbability';
import { ModifiedDie } from '../../src/game/ModifiedDie';

describe('DiceProbability', () => {
    it('uses installed mods as the source of truth for weight effects', () => {
        const die = new ModifiedDie({
            faceCount: 6,
            mods: [{ faceIndex: 0, grams: 1.0, id: 'weight-1.0g' }],
        });

        const chances = getFaceChances(die);

        expect(chances).toHaveLength(6);
        expect(chances[0]).toBeLessThan(chances[1]);
        expect(chances[0]).toBeLessThan(chances[5]);
    });

    it('does not infer probability changes from face stats when no mods are installed', () => {
        const die = new ModifiedDie({
            faceCount: 6,
            faceStats: [{ weight: 3 }],
            mods: [],
        });

        const chances = getFaceChances(die);
        const baseline = 100 / 6;

        for (const chance of chances) {
            expect(chance).toBeCloseTo(baseline, 6);
        }
    });

    it('applies extra preview mods on top of installed mods', () => {
        const die = new ModifiedDie({
            faceCount: 6,
            mods: [{ faceIndex: 0, grams: 1.0, id: 'weight-1.0g' }],
        });

        const base = getFaceChances(die);
        const preview = getFaceChances(die, [{ faceIndex: 1, grams: 1.0 }]);

        expect(preview[1]).toBeLessThan(base[1]);
        expect(preview[0]).toBeGreaterThan(base[0]);
    });
});
