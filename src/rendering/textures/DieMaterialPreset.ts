import {
    DIE_BODY_MATERIALS,
    DIE_SURFACE_FINISHES,
    type DieBodyMaterial,
    type DieMaterialPreset,
    type DieSurfaceFinish,
    type ResolveDieMaterialPresetInput,
} from './DieTextureTypes';

/**
 * Map of material types to their body + pip colors.
 * All 11 materials have distinct colors for visual verification during testing.
 */
const BODY_COLORS: Record<DieBodyMaterial, { backgroundColor: string; pipColor: string }> = {
    plastic: { backgroundColor: '#f5f5f2', pipColor: '#1f2c35' },
    wood: { backgroundColor: '#8b6f47', pipColor: '#2a1810' },
    stone: { backgroundColor: '#a0a0a0', pipColor: '#3a3a3a' },
    ceramic: { backgroundColor: '#f0e5d8', pipColor: '#4a3c32' },
    resin: { backgroundColor: '#e8d5c4', pipColor: '#2a2a2a' },
    brass: { backgroundColor: '#c8a15a', pipColor: '#342514' },
    steel: { backgroundColor: '#bcc7d1', pipColor: '#1c222a' },
    gold: { backgroundColor: '#d6b34d', pipColor: '#2f2411' },
    silver: { backgroundColor: '#d7dee7', pipColor: '#1d2630' },
    bronze: { backgroundColor: '#a87749', pipColor: '#2f2218' },
    copper: { backgroundColor: '#c88457', pipColor: '#35241b' },
    iron: { backgroundColor: '#7f8791', pipColor: '#171d24' },
    titanium: { backgroundColor: '#aeb8c7', pipColor: '#1a232d' },
    obsidian: { backgroundColor: '#1f1f1f', pipColor: '#e8e8e8' },
    jade: { backgroundColor: '#3a6a4a', pipColor: '#d8e8d0' },
    glass: { backgroundColor: '#e8f0f8', pipColor: '#2a2a3a' },
    crystal: { backgroundColor: '#f0f8ff', pipColor: '#3a4a5a' },
};

/**
 * Fallback color for unknown/unregistered materials.
 * Bright magenta (#ff00ff) makes failures immediately obvious during testing.
 */
const FALLBACK_COLOR = { backgroundColor: '#ff00ff', pipColor: '#00ff00' };

const FINISH_PROFILES: Record<DieSurfaceFinish, DieMaterialPreset['surface']> = {
    plain: {
        roughness: 0.56,
        metalness: 0.08,
        clearcoat: 0.2,
        clearcoatRoughness: 0.45,
    },
    etched: {
        roughness: 0.7,
        metalness: 0.05,
        clearcoat: 0.12,
        clearcoatRoughness: 0.55,
    },
    polished: {
        roughness: 0.26,
        metalness: 0.15,
        clearcoat: 0.86,
        clearcoatRoughness: 0.18,
    },
    hammered: {
        roughness: 0.78,
        metalness: 0.1,
        clearcoat: 0.1,
        clearcoatRoughness: 0.62,
    },
};

const METAL_MATERIALS = new Set<DieBodyMaterial>([
    'brass',
    'steel',
    'gold',
    'silver',
    'bronze',
    'copper',
    'iron',
    'titanium',
]);

type MetalMaterial = Extract<DieBodyMaterial, 'brass' | 'steel' | 'gold' | 'silver' | 'bronze' | 'copper' | 'iron' | 'titanium'>;

const METAL_SURFACE_OVERRIDES: Record<MetalMaterial, Record<DieSurfaceFinish, Partial<DieMaterialPreset['surface']>>> = {
    brass: {
        plain: {
            roughness: 0.3,
            metalness: 0.9,
            clearcoat: 0.28,
            clearcoatRoughness: 0.3,
        },
        etched: {
            roughness: 0.42,
            metalness: 0.86,
            clearcoat: 0.12,
            clearcoatRoughness: 0.42,
        },
        polished: {
            roughness: 0.12,
            metalness: 0.97,
            clearcoat: 0.96,
            clearcoatRoughness: 0.08,
        },
        hammered: {
            roughness: 0.5,
            metalness: 0.9,
            clearcoat: 0.14,
            clearcoatRoughness: 0.34,
        },
    },
    steel: {
        plain: {
            roughness: 0.24,
            metalness: 0.94,
            clearcoat: 0.18,
            clearcoatRoughness: 0.24,
        },
        etched: {
            roughness: 0.36,
            metalness: 0.92,
            clearcoat: 0.08,
            clearcoatRoughness: 0.36,
        },
        polished: {
            roughness: 0.08,
            metalness: 0.98,
            clearcoat: 0.88,
            clearcoatRoughness: 0.06,
        },
        hammered: {
            roughness: 0.44,
            metalness: 0.93,
            clearcoat: 0.1,
            clearcoatRoughness: 0.28,
        },
    },
    gold: {
        plain: {
            roughness: 0.2,
            metalness: 0.99,
            clearcoat: 0.35,
            clearcoatRoughness: 0.22,
        },
        etched: {
            roughness: 0.34,
            metalness: 0.98,
            clearcoat: 0.2,
            clearcoatRoughness: 0.3,
        },
        polished: {
            roughness: 0.06,
            metalness: 1,
            clearcoat: 0.98,
            clearcoatRoughness: 0.05,
        },
        hammered: {
            roughness: 0.36,
            metalness: 0.98,
            clearcoat: 0.18,
            clearcoatRoughness: 0.22,
        },
    },
    silver: {
        plain: {
            roughness: 0.19,
            metalness: 0.99,
            clearcoat: 0.26,
            clearcoatRoughness: 0.2,
        },
        etched: {
            roughness: 0.32,
            metalness: 0.98,
            clearcoat: 0.14,
            clearcoatRoughness: 0.26,
        },
        polished: {
            roughness: 0.05,
            metalness: 1,
            clearcoat: 0.94,
            clearcoatRoughness: 0.04,
        },
        hammered: {
            roughness: 0.34,
            metalness: 0.98,
            clearcoat: 0.16,
            clearcoatRoughness: 0.22,
        },
    },
    bronze: {
        plain: {
            roughness: 0.33,
            metalness: 0.93,
            clearcoat: 0.22,
            clearcoatRoughness: 0.29,
        },
        etched: {
            roughness: 0.46,
            metalness: 0.9,
            clearcoat: 0.1,
            clearcoatRoughness: 0.36,
        },
        polished: {
            roughness: 0.11,
            metalness: 0.96,
            clearcoat: 0.9,
            clearcoatRoughness: 0.08,
        },
        hammered: {
            roughness: 0.55,
            metalness: 0.9,
            clearcoat: 0.12,
            clearcoatRoughness: 0.31,
        },
    },
    copper: {
        plain: {
            roughness: 0.29,
            metalness: 0.94,
            clearcoat: 0.22,
            clearcoatRoughness: 0.27,
        },
        etched: {
            roughness: 0.43,
            metalness: 0.91,
            clearcoat: 0.1,
            clearcoatRoughness: 0.34,
        },
        polished: {
            roughness: 0.1,
            metalness: 0.97,
            clearcoat: 0.92,
            clearcoatRoughness: 0.08,
        },
        hammered: {
            roughness: 0.5,
            metalness: 0.9,
            clearcoat: 0.13,
            clearcoatRoughness: 0.3,
        },
    },
    iron: {
        plain: {
            roughness: 0.4,
            metalness: 0.86,
            clearcoat: 0.1,
            clearcoatRoughness: 0.28,
        },
        etched: {
            roughness: 0.52,
            metalness: 0.83,
            clearcoat: 0.06,
            clearcoatRoughness: 0.34,
        },
        polished: {
            roughness: 0.16,
            metalness: 0.9,
            clearcoat: 0.72,
            clearcoatRoughness: 0.1,
        },
        hammered: {
            roughness: 0.6,
            metalness: 0.82,
            clearcoat: 0.08,
            clearcoatRoughness: 0.34,
        },
    },
    titanium: {
        plain: {
            roughness: 0.23,
            metalness: 0.95,
            clearcoat: 0.2,
            clearcoatRoughness: 0.21,
        },
        etched: {
            roughness: 0.35,
            metalness: 0.94,
            clearcoat: 0.11,
            clearcoatRoughness: 0.27,
        },
        polished: {
            roughness: 0.07,
            metalness: 0.98,
            clearcoat: 0.88,
            clearcoatRoughness: 0.06,
        },
        hammered: {
            roughness: 0.38,
            metalness: 0.94,
            clearcoat: 0.12,
            clearcoatRoughness: 0.24,
        },
    },
};

function isBodyMaterial(value: string | undefined): value is DieBodyMaterial {
    if (!value) {
        return false;
    }

    return (DIE_BODY_MATERIALS as readonly string[]).includes(value);
}

function isSurfaceFinish(value: string | undefined): value is DieSurfaceFinish {
    if (!value) {
        return false;
    }

    return (DIE_SURFACE_FINISHES as readonly string[]).includes(value);
}

export function resolveDieMaterialPreset(input: ResolveDieMaterialPresetInput): DieMaterialPreset {
    const bodyMaterial: DieBodyMaterial = isBodyMaterial(input.bodyMaterial) ? input.bodyMaterial : 'plastic';
    const surfaceFinish: DieSurfaceFinish = isSurfaceFinish(input.surfaceFinish) ? input.surfaceFinish : 'plain';

    // Get color palette for this material, or use fallback if missing
    let base = BODY_COLORS[bodyMaterial];
    if (!base) {
        console.warn(`Material color palette missing for '${bodyMaterial}', using fallback debug color (magenta)`);
        base = FALLBACK_COLOR;
    }

    const surface = resolveSurfaceProfile(bodyMaterial, surfaceFinish);

    return {
        bodyMaterial,
        surfaceFinish,
        backgroundColor: input.fallbackBackgroundColor ?? base.backgroundColor,
        pipColor: input.fallbackPipColor ?? base.pipColor,
        surface,
    };
}

function resolveSurfaceProfile(bodyMaterial: DieBodyMaterial, surfaceFinish: DieSurfaceFinish): DieMaterialPreset['surface'] {
    const baseProfile = FINISH_PROFILES[surfaceFinish];

    if (!METAL_MATERIALS.has(bodyMaterial)) {
        return baseProfile;
    }

    return {
        ...baseProfile,
        ...METAL_SURFACE_OVERRIDES[bodyMaterial as MetalMaterial][surfaceFinish],
    };
}
