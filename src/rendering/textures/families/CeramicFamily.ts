import type { DieBodyMaterial, DieMaterialPreset, DieSurfaceFinish } from '../DieTextureTypes';

export const CERAMICS = ['ceramic'] as const;

type CeramicMaterial = typeof CERAMICS[number];

const CERAMIC_SURFACE_OVERRIDES: Record<CeramicMaterial, Record<DieSurfaceFinish, Partial<DieMaterialPreset['surface']>>> = {
    ceramic: {
        plain: { roughness: 0.52, metalness: 0, clearcoat: 0.24, clearcoatRoughness: 0.42 },
        etched: { roughness: 0.66, metalness: 0, clearcoat: 0.1, clearcoatRoughness: 0.56 },
        polished: { roughness: 0.4, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.32 },
        hammered: { roughness: 0.72, metalness: 0, clearcoat: 0.08, clearcoatRoughness: 0.64 },
    },
};

export function resolveCeramicProfile(material: DieBodyMaterial, finish: DieSurfaceFinish): Partial<DieMaterialPreset['surface']> | null {
    if (!CERAMICS.includes(material as CeramicMaterial)) {
        return null;
    }
    return CERAMIC_SURFACE_OVERRIDES[material as CeramicMaterial][finish] ?? null;
}
