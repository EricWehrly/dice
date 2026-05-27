/**
 * DiceProbability
 * 
 * Pure functions for calculating die face probabilities with modifications.
 * Used by UI layers (mod panel, rolling screen) to compute preview and actual chances.
 */

import { AVAILABLE_MODS, type AvailableModValue } from '../ui/DieModificationTypes';
import type { DieWeightMod } from './ModifiedDie';

const BASE_FACE_WEIGHT = 1;
const WEIGHT_FACTOR = 0.12;

// Distance-based influence model (integer distance, no physical units).
// d = 0: weighted face itself (strongly reduced face-up chance)
// d = 1: adjacent faces (slightly reduced face-up chance)
// d = 2: opposite face (increased face-up chance)
const SELF_DISTANCE_FACTOR = -1.0;
const ADJACENT_DISTANCE_FACTOR = -0.35;
const OPPOSITE_DISTANCE_FACTOR = 0.6;

export type DiceModel = {
    faceCount: number;
    mods?: DieWeightMod[];
};

function getInstalledWeightGrams(die: DiceModel, faceIndex: number): number {
    const mods = die.mods ?? [];
    let total = 0;
    for (const mod of mods) {
        if (mod.faceIndex === faceIndex) {
            total += mod.grams;
        }
    }

    return Math.max(0, total);
}

function getOppositeFaceIndex(faceCount: number, faceIndex: number): number {
    // D6 mapping: faces 1..6 are paired to sum to 7.
    // With zero-based indexes this is index + oppositeIndex = 5.
    if (faceCount === 6) {
        return 5 - faceIndex;
    }

    return -1;
}

function getIntegerFaceDistance(faceCount: number, sourceFaceIndex: number, targetFaceIndex: number): 0 | 1 | 2 {
    if (sourceFaceIndex === targetFaceIndex) {
        return 0;
    }

    const opposite = getOppositeFaceIndex(faceCount, sourceFaceIndex);
    if (opposite === targetFaceIndex) {
        return 2;
    }

    return 1;
}

function getDistanceFactor(distance: 0 | 1 | 2): number {
    if (distance === 0) {
        return SELF_DISTANCE_FACTOR;
    }
    if (distance === 2) {
        return OPPOSITE_DISTANCE_FACTOR;
    }
    return ADJACENT_DISTANCE_FACTOR;
}

/**
 * Get the weight in grams for a modification value.
 * Used to convert mod option selections into actual weight deltas.
 */
export function getModGrams(modValue: AvailableModValue): number {
    const selected = AVAILABLE_MODS.find((item) => item.value === modValue);
    if (!selected) {
        return 0;
    }
    return selected.grams;
}

/**
 * Calculate face-by-face face-up chance percentages given installed and preview weights.
 *
 * Model is intentionally simple and purely math-based:
 * - Integer face distance only (0=self, 1=adjacent, 2=opposite)
 * - No physical units, no geometry simulation
 * - Weighted face and adjacent faces trend down in face-up chance
 * - Opposite face trends up in face-up chance
 */
export function getFaceChances(die: DiceModel, extraMods: DieWeightMod[] = []): number[] {
    const weights = Array.from({ length: die.faceCount }, () => BASE_FACE_WEIGHT);

    const allMods: DieWeightMod[] = [];
    for (let faceIndex = 0; faceIndex < die.faceCount; faceIndex += 1) {
        const grams = getInstalledWeightGrams(die, faceIndex);
        if (grams > 0) {
            allMods.push({ faceIndex, grams });
        }
    }
    for (const mod of extraMods) {
        if (mod.faceIndex >= 0 && mod.faceIndex < die.faceCount && mod.grams > 0) {
            allMods.push(mod);
        }
    }

    for (const mod of allMods) {
        const impact = mod.grams * WEIGHT_FACTOR;
        for (let targetFaceIndex = 0; targetFaceIndex < die.faceCount; targetFaceIndex += 1) {
            const distance = getIntegerFaceDistance(die.faceCount, mod.faceIndex, targetFaceIndex);
            const factor = getDistanceFactor(distance);
            weights[targetFaceIndex] = Math.max(0.05, weights[targetFaceIndex] + impact * factor);
        }
    }

    const total = weights.reduce((sum, value) => sum + value, 0);
    return weights.map((value) => (value / total) * 100);
}

/**
 * Calculate face-by-face probability percentages with draft modifications applied.
 * Used by UI to show live preview of what probabilities would be if draft mods were installed.
 */
export function getPreviewChances(die: DiceModel, draftFaceMods: AvailableModValue[]): number[] {
    const desiredGramsByFace = Array.from({ length: die.faceCount }, (_, faceIndex) =>
        getInstalledWeightGrams(die, faceIndex)
    );

    for (let faceIndex = 0; faceIndex < draftFaceMods.length && faceIndex < desiredGramsByFace.length; faceIndex += 1) {
        desiredGramsByFace[faceIndex] = getModGrams(draftFaceMods[faceIndex]);
    }

    const previewMods: DieWeightMod[] = [];
    for (let faceIndex = 0; faceIndex < desiredGramsByFace.length; faceIndex += 1) {
        const grams = desiredGramsByFace[faceIndex];
        if (grams > 0) {
            previewMods.push({ faceIndex, grams });
        }
    }

    return getFaceChances({ faceCount: die.faceCount }, previewMods);
}
