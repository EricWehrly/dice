import type { DieMaterialPreset, DieSurfaceFinish } from '../DieTextureTypes';

export const STONE_MINERALS = ['stone', 'obsidian', 'jade', 'marble', 'granite'] as const;

export type StoneMineralMaterial = typeof STONE_MINERALS[number];

export const STONE_MINERAL_EFFECT_PRESETS = [
    'wide-river-mineral',
    'narrow-river-mineral-negative',
    'dense-speckle-mineral',
    'sparse-speckle-mineral-negative',
    'glassy-dark-mineral',
    'waxy-green-mineral',
] as const;

export type StoneMineralEffectPreset = typeof STONE_MINERAL_EFFECT_PRESETS[number];

type StructuralDirection = 'horizontal' | 'vertical' | 'diagonal';

interface StoneMineralEffectPresetDefinition {
    readonly label: string;
    readonly purpose: 'target' | 'negative';
    readonly breakupAlpha: number;
    readonly breakupBandStep: number;
    readonly breakupDirection: StructuralDirection;
    readonly veinAlpha: number;
    readonly veinCount: number;
    readonly veinAmplitude: number;
    readonly inclusionDensityScale: number;
    readonly inclusionSizeMax: number;
    readonly roughnessByFinish: Record<DieSurfaceFinish, number>;
    readonly surfaceByFinish: Record<DieSurfaceFinish, Partial<DieMaterialPreset['surface']>>;
}

export const STONE_MINERAL_PRESET_DEFINITIONS: Record<StoneMineralEffectPreset, StoneMineralEffectPresetDefinition> = {
    'wide-river-mineral': {
        label: 'Wide River Mineral',
        purpose: 'target',
        breakupAlpha: 0.05,
        breakupBandStep: 12,
        breakupDirection: 'diagonal',
        veinAlpha: 0.08,
        veinCount: 4,
        veinAmplitude: 18,
        inclusionDensityScale: 0.22,
        inclusionSizeMax: 2,
        roughnessByFinish: {
            plain: 0.44,
            etched: 0.58,
            polished: 0.28,
            hammered: 0.66,
        },
        surfaceByFinish: {
            plain: { roughness: 0.44, metalness: 0, clearcoat: 0.26, clearcoatRoughness: 0.38 },
            etched: { roughness: 0.58, metalness: 0, clearcoat: 0.14, clearcoatRoughness: 0.52 },
            polished: { roughness: 0.28, metalness: 0, clearcoat: 0.42, clearcoatRoughness: 0.24 },
            hammered: { roughness: 0.66, metalness: 0, clearcoat: 0.08, clearcoatRoughness: 0.6 },
        },
    },
    'narrow-river-mineral-negative': {
        label: 'Narrow River Mineral Negative',
        purpose: 'negative',
        breakupAlpha: 0.045,
        breakupBandStep: 11,
        breakupDirection: 'diagonal',
        veinAlpha: 0.035,
        veinCount: 8,
        veinAmplitude: 6,
        inclusionDensityScale: 0.18,
        inclusionSizeMax: 1,
        roughnessByFinish: {
            plain: 0.48,
            etched: 0.61,
            polished: 0.31,
            hammered: 0.69,
        },
        surfaceByFinish: {
            plain: { roughness: 0.48, metalness: 0, clearcoat: 0.22, clearcoatRoughness: 0.42 },
            etched: { roughness: 0.61, metalness: 0, clearcoat: 0.12, clearcoatRoughness: 0.54 },
            polished: { roughness: 0.31, metalness: 0, clearcoat: 0.36, clearcoatRoughness: 0.28 },
            hammered: { roughness: 0.69, metalness: 0, clearcoat: 0.07, clearcoatRoughness: 0.62 },
        },
    },
    'dense-speckle-mineral': {
        label: 'Dense Speckle Mineral',
        purpose: 'target',
        breakupAlpha: 0.075,
        breakupBandStep: 9,
        breakupDirection: 'horizontal',
        veinAlpha: 0.02,
        veinCount: 3,
        veinAmplitude: 8,
        inclusionDensityScale: 0.85,
        inclusionSizeMax: 2,
        roughnessByFinish: {
            plain: 0.68,
            etched: 0.78,
            polished: 0.48,
            hammered: 0.84,
        },
        surfaceByFinish: {
            plain: { roughness: 0.68, metalness: 0.02, clearcoat: 0.1, clearcoatRoughness: 0.62 },
            etched: { roughness: 0.78, metalness: 0.01, clearcoat: 0.06, clearcoatRoughness: 0.7 },
            polished: { roughness: 0.48, metalness: 0.03, clearcoat: 0.2, clearcoatRoughness: 0.44 },
            hammered: { roughness: 0.84, metalness: 0.01, clearcoat: 0.04, clearcoatRoughness: 0.76 },
        },
    },
    'sparse-speckle-mineral-negative': {
        label: 'Sparse Speckle Mineral Negative',
        purpose: 'negative',
        breakupAlpha: 0.05,
        breakupBandStep: 10,
        breakupDirection: 'horizontal',
        veinAlpha: 0.015,
        veinCount: 2,
        veinAmplitude: 6,
        inclusionDensityScale: 0.18,
        inclusionSizeMax: 1,
        roughnessByFinish: {
            plain: 0.71,
            etched: 0.8,
            polished: 0.52,
            hammered: 0.86,
        },
        surfaceByFinish: {
            plain: { roughness: 0.71, metalness: 0, clearcoat: 0.06, clearcoatRoughness: 0.68 },
            etched: { roughness: 0.8, metalness: 0, clearcoat: 0.04, clearcoatRoughness: 0.75 },
            polished: { roughness: 0.52, metalness: 0, clearcoat: 0.14, clearcoatRoughness: 0.52 },
            hammered: { roughness: 0.86, metalness: 0, clearcoat: 0.02, clearcoatRoughness: 0.8 },
        },
    },
    'glassy-dark-mineral': {
        label: 'Glassy Dark Mineral',
        purpose: 'target',
        breakupAlpha: 0.038,
        breakupBandStep: 14,
        breakupDirection: 'diagonal',
        veinAlpha: 0.03,
        veinCount: 4,
        veinAmplitude: 9,
        inclusionDensityScale: 0.24,
        inclusionSizeMax: 1,
        roughnessByFinish: {
            plain: 0.55,
            etched: 0.62,
            polished: 0.31,
            hammered: 0.67,
        },
        surfaceByFinish: {
            plain: { roughness: 0.42, metalness: 0.04, clearcoat: 0.28, clearcoatRoughness: 0.36 },
            etched: { roughness: 0.58, metalness: 0.02, clearcoat: 0.16, clearcoatRoughness: 0.5 },
            polished: { roughness: 0.22, metalness: 0.06, clearcoat: 0.45, clearcoatRoughness: 0.22 },
            hammered: { roughness: 0.64, metalness: 0.01, clearcoat: 0.1, clearcoatRoughness: 0.58 },
        },
    },
    'waxy-green-mineral': {
        label: 'Waxy Green Mineral',
        purpose: 'target',
        breakupAlpha: 0.048,
        breakupBandStep: 11,
        breakupDirection: 'diagonal',
        veinAlpha: 0.055,
        veinCount: 4,
        veinAmplitude: 16,
        inclusionDensityScale: 0.32,
        inclusionSizeMax: 2,
        roughnessByFinish: {
            plain: 0.49,
            etched: 0.58,
            polished: 0.35,
            hammered: 0.63,
        },
        surfaceByFinish: {
            plain: { roughness: 0.49, metalness: 0, clearcoat: 0.22, clearcoatRoughness: 0.42 },
            etched: { roughness: 0.6, metalness: 0, clearcoat: 0.12, clearcoatRoughness: 0.54 },
            polished: { roughness: 0.35, metalness: 0, clearcoat: 0.32, clearcoatRoughness: 0.28 },
            hammered: { roughness: 0.68, metalness: 0, clearcoat: 0.08, clearcoatRoughness: 0.62 },
        },
    },
};

export const STONE_MINERAL_MATERIAL_TO_PRESET: Record<StoneMineralMaterial, StoneMineralEffectPreset> = {
    stone: 'dense-speckle-mineral',
    obsidian: 'glassy-dark-mineral',
    jade: 'waxy-green-mineral',
    marble: 'wide-river-mineral',
    granite: 'dense-speckle-mineral',
};

export function resolveStoneMineralEffectPreset(material: StoneMineralMaterial): StoneMineralEffectPreset {
    return STONE_MINERAL_MATERIAL_TO_PRESET[material];
}
