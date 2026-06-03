import type { DieBodyMaterial, DieMaterialPreset, DieSurfaceFinish } from '../DieTextureTypes';

export const METALS = [
    'brass',
    'steel',
    'gold',
    'silver',
    'bronze',
    'copper',
    'iron',
    'titanium',
] as const;

type MetalMaterial = typeof METALS[number];

const METAL_SURFACE_OVERRIDES: Record<MetalMaterial, Record<DieSurfaceFinish, Partial<DieMaterialPreset['surface']>>> = {
    brass: {
        plain: { roughness: 0.3, metalness: 0.9, clearcoat: 0.28, clearcoatRoughness: 0.3 },
        etched: { roughness: 0.42, metalness: 0.86, clearcoat: 0.12, clearcoatRoughness: 0.42 },
        polished: { roughness: 0.26, metalness: 0.82, clearcoat: 0.3, clearcoatRoughness: 0.26 },
        hammered: { roughness: 0.5, metalness: 0.9, clearcoat: 0.14, clearcoatRoughness: 0.34 },
    },
    steel: {
        plain: { roughness: 0.24, metalness: 0.94, clearcoat: 0.18, clearcoatRoughness: 0.24 },
        etched: { roughness: 0.36, metalness: 0.92, clearcoat: 0.08, clearcoatRoughness: 0.36 },
        polished: { roughness: 0.14, metalness: 0.9, clearcoat: 0.24, clearcoatRoughness: 0.16 },
        hammered: { roughness: 0.44, metalness: 0.93, clearcoat: 0.1, clearcoatRoughness: 0.28 },
    },
    gold: {
        plain: { roughness: 0.2, metalness: 0.99, clearcoat: 0.35, clearcoatRoughness: 0.22 },
        etched: { roughness: 0.34, metalness: 0.98, clearcoat: 0.2, clearcoatRoughness: 0.3 },
        polished: { roughness: 0.1, metalness: 0.99, clearcoat: 0.3, clearcoatRoughness: 0.12 },
        hammered: { roughness: 0.36, metalness: 0.98, clearcoat: 0.18, clearcoatRoughness: 0.22 },
    },
    silver: {
        plain: { roughness: 0.19, metalness: 0.99, clearcoat: 0.26, clearcoatRoughness: 0.2 },
        etched: { roughness: 0.32, metalness: 0.98, clearcoat: 0.14, clearcoatRoughness: 0.26 },
        polished: { roughness: 0.05, metalness: 1, clearcoat: 0.94, clearcoatRoughness: 0.04 },
        hammered: { roughness: 0.34, metalness: 0.98, clearcoat: 0.16, clearcoatRoughness: 0.22 },
    },
    bronze: {
        plain: { roughness: 0.33, metalness: 0.93, clearcoat: 0.22, clearcoatRoughness: 0.29 },
        etched: { roughness: 0.46, metalness: 0.9, clearcoat: 0.1, clearcoatRoughness: 0.36 },
        polished: { roughness: 0.28, metalness: 0.84, clearcoat: 0.22, clearcoatRoughness: 0.24 },
        hammered: { roughness: 0.55, metalness: 0.9, clearcoat: 0.12, clearcoatRoughness: 0.31 },
    },
    copper: {
        plain: { roughness: 0.29, metalness: 0.94, clearcoat: 0.22, clearcoatRoughness: 0.27 },
        etched: { roughness: 0.43, metalness: 0.91, clearcoat: 0.1, clearcoatRoughness: 0.34 },
        polished: { roughness: 0.26, metalness: 0.86, clearcoat: 0.24, clearcoatRoughness: 0.22 },
        hammered: { roughness: 0.5, metalness: 0.9, clearcoat: 0.13, clearcoatRoughness: 0.3 },
    },
    iron: {
        plain: { roughness: 0.4, metalness: 0.86, clearcoat: 0.1, clearcoatRoughness: 0.28 },
        etched: { roughness: 0.52, metalness: 0.83, clearcoat: 0.06, clearcoatRoughness: 0.34 },
        polished: { roughness: 0.3, metalness: 0.8, clearcoat: 0.18, clearcoatRoughness: 0.28 },
        hammered: { roughness: 0.6, metalness: 0.82, clearcoat: 0.08, clearcoatRoughness: 0.34 },
    },
    titanium: {
        plain: { roughness: 0.23, metalness: 0.95, clearcoat: 0.2, clearcoatRoughness: 0.21 },
        etched: { roughness: 0.35, metalness: 0.94, clearcoat: 0.11, clearcoatRoughness: 0.27 },
        polished: { roughness: 0.26, metalness: 0.82, clearcoat: 0.2, clearcoatRoughness: 0.24 },
        hammered: { roughness: 0.38, metalness: 0.94, clearcoat: 0.12, clearcoatRoughness: 0.24 },
    },
};

export function resolveMetalProfile(material: DieBodyMaterial, finish: DieSurfaceFinish): Partial<DieMaterialPreset['surface']> | null {
    if (!METALS.includes(material as MetalMaterial)) {
        return null;
    }
    return METAL_SURFACE_OVERRIDES[material as MetalMaterial][finish] ?? null;
}
