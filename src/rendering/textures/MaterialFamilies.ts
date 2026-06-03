import type { DieBodyMaterial, DieMaterialPreset, DieSurfaceFinish } from './DieTextureTypes';
import { METALS, resolveMetalProfile } from './families/MetalFamily';
import { SYNTHETICS, resolveSyntheticProfile } from './families/SyntheticFamily';
import { CERAMICS, resolveCeramicProfile } from './families/CeramicFamily';
import { STONE_MINERALS } from './families/StoneMineralPresets';
import { resolveStoneMineralProfile } from './families/StoneMineralFamily';

// Re-export family material lists
export { METALS, SYNTHETICS, CERAMICS, STONE_MINERALS };

// Create Sets for backwards compatibility
export const METAL_MATERIALS = new Set<DieBodyMaterial>(METALS);
export const SYNTHETIC_MATERIALS = new Set<DieBodyMaterial>(SYNTHETICS);
export const CERAMIC_FAMILY_MATERIALS = new Set<DieBodyMaterial>(CERAMICS);
export const STONE_MINERAL_MATERIALS = new Set<DieBodyMaterial>(STONE_MINERALS);

// Centralized resolver: chains through families
export function resolveFamilyProfile(material: DieBodyMaterial, finish: DieSurfaceFinish): Partial<DieMaterialPreset['surface']> | null {
    return (
        resolveMetalProfile(material, finish) ||
        resolveSyntheticProfile(material, finish) ||
        resolveCeramicProfile(material, finish) ||
        resolveStoneMineralProfile(material, finish)
    );
}

export const WOOD_MATERIALS = new Set<DieBodyMaterial>([
    'wood',
]);

export const GEM_GLASS_MATERIALS = new Set<DieBodyMaterial>([
    'glass',
    'crystal',
]);

export type MaterialFamily =
    | 'metal'
    | 'synthetic'
    | 'ceramic'
    | 'stone'
    | 'wood'
    | 'gem'
    | 'other';

const FAMILY_MAP: Array<[Set<DieBodyMaterial>, MaterialFamily]> = [
    [METAL_MATERIALS, 'metal'],
    [SYNTHETIC_MATERIALS, 'synthetic'],
    [CERAMIC_FAMILY_MATERIALS, 'ceramic'],
    [STONE_MINERAL_MATERIALS, 'stone'],
    [WOOD_MATERIALS, 'wood'],
    [GEM_GLASS_MATERIALS, 'gem'],
];

export function getFamilyForMaterial(material: DieBodyMaterial): MaterialFamily {
    for (const [set, family] of FAMILY_MAP) {
        if (set.has(material)) return family;
    }
    return 'other';
}
