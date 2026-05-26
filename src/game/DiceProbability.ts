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
 * Calculate face-by-face probability percentages given a die and its actual mods.
 * Higher probability faces are weighted down by their mods.
 */
export function getFaceChances(die: DiceModel, extraMods: DieWeightMod[] = []): number[] {
    const weights = Array.from({ length: die.faceCount }, () => BASE_FACE_WEIGHT);

    for (let faceIndex = 0; faceIndex < weights.length; faceIndex += 1) {
        const installedWeight = getInstalledWeightGrams(die, faceIndex);
        if (installedWeight > 0) {
            weights[faceIndex] = Math.max(0.05, weights[faceIndex] - installedWeight * WEIGHT_FACTOR);
        }
    }

    for (const mod of extraMods) {
        if (mod.faceIndex >= 0 && mod.faceIndex < weights.length) {
            weights[mod.faceIndex] = Math.max(0.05, weights[mod.faceIndex] - mod.grams * WEIGHT_FACTOR);
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
    const previewMods: DieWeightMod[] = [];

    for (let faceIndex = 0; faceIndex < draftFaceMods.length; faceIndex += 1) {
        const modValue = draftFaceMods[faceIndex];
        const grams = getModGrams(modValue);
        if (modValue !== 'none' && grams > 0) {
            previewMods.push({ faceIndex, grams });
        }
    }

    if (previewMods.length === 0) {
        return getFaceChances(die);
    }

    return getFaceChances(die, previewMods);
}
