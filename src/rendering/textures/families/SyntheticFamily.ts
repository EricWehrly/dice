import type { DieBodyMaterial, DieMaterialPreset, DieSurfaceFinish } from '../DieTextureTypes';

export const SYNTHETICS = ['plastic', 'resin'] as const;

type SyntheticMaterial = typeof SYNTHETICS[number];

const SYNTHETIC_SURFACE_OVERRIDES: Record<SyntheticMaterial, Record<DieSurfaceFinish, Partial<DieMaterialPreset['surface']>>> = {
    plastic: {
        plain: { roughness: 0.58, metalness: 0.02, clearcoat: 0.1, clearcoatRoughness: 0.52 },
        etched: { roughness: 0.7, metalness: 0.01, clearcoat: 0.06, clearcoatRoughness: 0.62 },
        polished: { roughness: 0.46, metalness: 0.03, clearcoat: 0.17, clearcoatRoughness: 0.4 },
        hammered: { roughness: 0.74, metalness: 0.02, clearcoat: 0.05, clearcoatRoughness: 0.68 },
    },
    resin: {
        plain: { roughness: 0.47, metalness: 0.02, clearcoat: 0.2, clearcoatRoughness: 0.4 },
        etched: { roughness: 0.56, metalness: 0.01, clearcoat: 0.13, clearcoatRoughness: 0.5 },
        polished: { roughness: 0.33, metalness: 0.02, clearcoat: 0.28, clearcoatRoughness: 0.28 },
        hammered: { roughness: 0.63, metalness: 0.01, clearcoat: 0.1, clearcoatRoughness: 0.58 },
    },
};

export function resolveSyntheticProfile(material: DieBodyMaterial, finish: DieSurfaceFinish): Partial<DieMaterialPreset['surface']> | null {
    if (!SYNTHETICS.includes(material as SyntheticMaterial)) {
        return null;
    }
    return SYNTHETIC_SURFACE_OVERRIDES[material as SyntheticMaterial][finish] ?? null;
}
