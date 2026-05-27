import { describe, expect, it } from 'vitest';
import { getFaceChances, getPreviewChances } from '../../src/game/DiceProbability';
import { ModifiedDie } from '../../src/game/ModifiedDie';

describe('DiceProbability', () => {
    it('returns normalized face-up chance percentages that sum to 100', () => {
        const die = new ModifiedDie({
            faceCount: 6,
            mod: { faceIndex: 0, grams: 1.5, id: 'weight-1.5g' },
        });

        const chances = getFaceChances(die);
        const sum = chances.reduce((total, value) => total + value, 0);

        expect(chances.every((value) => Number.isFinite(value) && value >= 0)).toBe(true);
        expect(sum).toBeCloseTo(100, 6);
    });

    it('uses installed mods as the source of truth for weight effects', () => {
        const die = new ModifiedDie({
            faceCount: 6,
            mod: { faceIndex: 0, grams: 1.0, id: 'weight-1.0g' },
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
            mod: { faceIndex: 0, grams: 1.0, id: 'weight-1.0g' },
        });

        const base = getFaceChances(die);
        const preview = getFaceChances(die, [{ faceIndex: 1, grams: 1.0 }]);

        expect(preview[1]).toBeLessThan(base[1]);
        expect(preview[4]).toBeGreaterThan(base[4]); // opposite of face index 1
    });

    it('treats draft preview as replacement, not additive stacking, on the same face', () => {
        const die = new ModifiedDie({
            faceCount: 6,
            mod: { faceIndex: 0, grams: 1.0, id: 'weight-1.0g' },
        });

        const draftCurrent = ['weight-1.0', 'none', 'none', 'none', 'none', 'none'] as const;
        const current = getPreviewChances(die, [...draftCurrent]);

        const draftNext = ['weight-2.0', 'none', 'none', 'none', 'none', 'none'] as const;
        const preview = getPreviewChances(die, [...draftNext]);

        const expectedReplacement = getFaceChances(
            { faceCount: 6 },
            [{ faceIndex: 0, grams: 2.0 }],
        );

        const expectedStacked = getFaceChances(
            { faceCount: 6 },
            [{ faceIndex: 0, grams: 3.0 }],
        );

        for (let i = 0; i < 6; i += 1) {
            expect(preview[i]).toBeCloseTo(expectedReplacement[i], 6);
        }

        expect(preview[0]).not.toBeCloseTo(expectedStacked[0], 6);
        expect(preview[0]).not.toBeCloseTo(current[0], 6);
    });

    it('returns naked probabilities when draft clears an installed weight', () => {
        const die = new ModifiedDie({
            faceCount: 6,
            mod: { faceIndex: 0, grams: 1.5, id: 'weight-1.5g' },
        });

        const clearedDraft = ['none', 'none', 'none', 'none', 'none', 'none'] as const;
        const preview = getPreviewChances(die, [...clearedDraft]);
        const naked = getFaceChances({ faceCount: 6 });

        for (let i = 0; i < 6; i += 1) {
            expect(preview[i]).toBeCloseTo(naked[i], 6);
        }
    });

    it('increases installed face probability when changing to lighter weight', () => {
        const die = new ModifiedDie({
            faceCount: 6,
            mod: { faceIndex: 0, grams: 2.0, id: 'weight-2.0g' },
        });

        const currentDraft = ['weight-2.0', 'none', 'none', 'none', 'none', 'none'] as const;
        const lighterDraft = ['weight-1.0', 'none', 'none', 'none', 'none', 'none'] as const;

        const current = getPreviewChances(die, [...currentDraft]);
        const lighter = getPreviewChances(die, [...lighterDraft]);

        // Installed face recovers face-up chance when weight is reduced.
        expect(lighter[0]).toBeGreaterThan(current[0]);

        // Opposite face gives up some of its compensating gain.
        expect(lighter[5]).toBeLessThan(current[5]);

        // Adjacent faces recover from nearby down-bias.
        for (const adjacentIndex of [1, 2, 3, 4]) {
            expect(lighter[adjacentIndex]).toBeGreaterThan(current[adjacentIndex]);
        }
    });

    it('decreases installed face probability when changing to heavier weight', () => {
        const die = new ModifiedDie({
            faceCount: 6,
            mod: { faceIndex: 0, grams: 1.0, id: 'weight-1.0g' },
        });

        const currentDraft = ['weight-1.0', 'none', 'none', 'none', 'none', 'none'] as const;
        const heavierDraft = ['weight-2.0', 'none', 'none', 'none', 'none', 'none'] as const;

        const current = getPreviewChances(die, [...currentDraft]);
        const heavier = getPreviewChances(die, [...heavierDraft]);

        // Installed face loses face-up chance when weight is increased.
        expect(heavier[0]).toBeLessThan(current[0]);

        // Opposite face gains more face-up chance.
        expect(heavier[5]).toBeGreaterThan(current[5]);

        // Adjacent faces get slightly more down-bias.
        for (const adjacentIndex of [1, 2, 3, 4]) {
            expect(heavier[adjacentIndex]).toBeLessThan(current[adjacentIndex]);
        }
    });

    it('opposite face gains more than adjacent faces when adding weight', () => {
        const die = new ModifiedDie({ faceCount: 6 });
        const baseline = getFaceChances(die);
        const weighted = getFaceChances(die, [{ faceIndex: 0, grams: 2.0 }]);

        // D6 convention: face index 0 (face 1) opposite is index 5 (face 6).
        const oppositeDelta = weighted[5] - baseline[5];
        const adjacentDeltas = [1, 2, 3, 4].map((index) => weighted[index] - baseline[index]);

        for (const adjacentDelta of adjacentDeltas) {
            expect(oppositeDelta).toBeGreaterThan(adjacentDelta);
        }
    });

    it('adjacent faces lose some face-up chance when a nearby face is weighted', () => {
        const die = new ModifiedDie({ faceCount: 6 });
        const baseline = getFaceChances(die);
        const weighted = getFaceChances(die, [{ faceIndex: 0, grams: 2.0 }]);

        // Adjacent to face index 0 for a cube: indexes 1..4.
        for (const adjacentIndex of [1, 2, 3, 4]) {
            expect(weighted[adjacentIndex]).toBeLessThan(baseline[adjacentIndex]);
        }
    });
});
