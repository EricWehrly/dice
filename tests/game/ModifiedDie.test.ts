import { describe, expect, it } from 'vitest';
import { FACE_STAT_KEYS } from '../../src/game/DieStatKeys';
import { ModifiedDie } from '../../src/game/ModifiedDie';

describe('ModifiedDie', () => {
    it('tracks installed mods and applies their stat side-effects', () => {
        const die = new ModifiedDie({
            faceCount: 6,
            mods: [
                { faceIndex: 0, grams: 1.0, id: 'weight-1.0g' },
                { faceIndex: 0, grams: 1.5, id: 'weight-1.5g' },
                { faceIndex: 3, grams: 0.5, id: 'weight-0.5g' },
            ],
            coreMods: [{ id: 'core' }],
        });

        expect(die.mods).toHaveLength(3);
        expect(die.getFaceStat(0, FACE_STAT_KEYS.WEIGHT)).toBeCloseTo(2.5, 6);
        expect(die.getFaceStat(3, FACE_STAT_KEYS.WEIGHT)).toBeCloseTo(0.5, 6);
        expect(die.coreMods).toHaveLength(1);
    });

    it('addWeightMod installs a mod record and updates weight stat', () => {
        const die = new ModifiedDie({ faceCount: 6 });

        die.addWeightMod(2, 1.25);

        expect(die.mods).toHaveLength(1);
        expect(die.mods[0]).toMatchObject({ faceIndex: 2, grams: 1.25 });
        expect(die.getFaceStat(2, FACE_STAT_KEYS.WEIGHT)).toBeCloseTo(1.25, 6);
    });

    it('ignores invalid mod installs', () => {
        const die = new ModifiedDie({ faceCount: 6 });

        die.addWeightMod(-1, 1.0);
        die.addWeightMod(999, 1.0);
        die.addWeightMod(1, 0);
        die.addWeightMod(1, -1);

        expect(die.mods).toHaveLength(0);
        expect(die.getFaceStat(1, FACE_STAT_KEYS.WEIGHT)).toBe(0);
    });
});
