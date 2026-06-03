import type { DieBodyMaterial, DieMaterialPreset, DieSurfaceFinish } from '../DieTextureTypes';

export const STONE_MINERALS = ['stone', 'obsidian', 'jade', 'marble', 'granite'] as const;

type StoneMineralMaterial = typeof STONE_MINERALS[number];

const STONE_MINERAL_SURFACE_OVERRIDES: Record<StoneMineralMaterial, Record<DieSurfaceFinish, Partial<DieMaterialPreset['surface']>>> = {
    stone: {
        plain: { roughness: 0.71, metalness: 0, clearcoat: 0.06, clearcoatRoughness: 0.68 },
        etched: { roughness: 0.82, metalness: 0, clearcoat: 0.04, clearcoatRoughness: 0.75 },
        polished: { roughness: 0.52, metalness: 0, clearcoat: 0.14, clearcoatRoughness: 0.52 },
        hammered: { roughness: 0.88, metalness: 0, clearcoat: 0.02, clearcoatRoughness: 0.8 },
    },
    obsidian: {
        plain: { roughness: 0.42, metalness: 0.04, clearcoat: 0.28, clearcoatRoughness: 0.36 },
        etched: { roughness: 0.58, metalness: 0.02, clearcoat: 0.16, clearcoatRoughness: 0.5 },
        polished: { roughness: 0.22, metalness: 0.06, clearcoat: 0.45, clearcoatRoughness: 0.22 },
        hammered: { roughness: 0.64, metalness: 0.01, clearcoat: 0.1, clearcoatRoughness: 0.58 },
    },
    jade: {
        plain: { roughness: 0.49, metalness: 0, clearcoat: 0.22, clearcoatRoughness: 0.42 },
        etched: { roughness: 0.6, metalness: 0, clearcoat: 0.12, clearcoatRoughness: 0.54 },
        polished: { roughness: 0.35, metalness: 0, clearcoat: 0.32, clearcoatRoughness: 0.28 },
        hammered: { roughness: 0.68, metalness: 0, clearcoat: 0.08, clearcoatRoughness: 0.62 },
    },
    marble: {
        plain: { roughness: 0.44, metalness: 0, clearcoat: 0.26, clearcoatRoughness: 0.38 },
        etched: { roughness: 0.58, metalness: 0, clearcoat: 0.14, clearcoatRoughness: 0.52 },
        polished: { roughness: 0.28, metalness: 0, clearcoat: 0.42, clearcoatRoughness: 0.24 },
        hammered: { roughness: 0.66, metalness: 0, clearcoat: 0.08, clearcoatRoughness: 0.6 },
    },
    granite: {
        plain: { roughness: 0.68, metalness: 0.02, clearcoat: 0.1, clearcoatRoughness: 0.62 },
        etched: { roughness: 0.78, metalness: 0.01, clearcoat: 0.06, clearcoatRoughness: 0.7 },
        polished: { roughness: 0.48, metalness: 0.03, clearcoat: 0.2, clearcoatRoughness: 0.44 },
        hammered: { roughness: 0.84, metalness: 0.01, clearcoat: 0.04, clearcoatRoughness: 0.76 },
    },
};

export function resolveStoneMineralProfile(material: DieBodyMaterial, finish: DieSurfaceFinish): Partial<DieMaterialPreset['surface']> | null {
    if (!STONE_MINERALS.includes(material as StoneMineralMaterial)) {
        return null;
    }
    return STONE_MINERAL_SURFACE_OVERRIDES[material as StoneMineralMaterial][finish] ?? null;
}
