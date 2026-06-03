import {
    DIE_BODY_MATERIALS,
    DIE_SURFACE_FINISHES,
    type DieBodyMaterial,
    type DieMaterialPreset,
    type DieSurfaceFinish,
    type ResolveDieMaterialPresetInput,
} from './DieTextureTypes';
import {
    resolveFamilyProfile,
    METAL_MATERIALS,
    SYNTHETIC_MATERIALS,
    CERAMIC_FAMILY_MATERIALS,
    STONE_MINERAL_MATERIALS,
} from './MaterialFamilies';

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
    marble: { backgroundColor: '#f0ece8', pipColor: '#2a2a2a' },
    granite: { backgroundColor: '#8b7b72', pipColor: '#f0ece8' },
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
        roughness: 0.4,
        metalness: 0.08,
        clearcoat: 0.22,
        clearcoatRoughness: 0.38,
    },
    hammered: {
        roughness: 0.78,
        metalness: 0.1,
        clearcoat: 0.1,
        clearcoatRoughness: 0.62,
    },
};

type MetalMaterial = Extract<DieBodyMaterial, 'brass' | 'steel' | 'gold' | 'silver' | 'bronze' | 'copper' | 'iron' | 'titanium'>;

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

function resolveSurfaceProfile(bodyMaterial: DieBodyMaterial, surfaceFinish: DieSurfaceFinish): DieMaterialPreset['surface'] {
    const baseProfile = FINISH_PROFILES[surfaceFinish];
    const familyOverride = resolveFamilyProfile(bodyMaterial, surfaceFinish);

    return familyOverride ? { ...baseProfile, ...familyOverride } : baseProfile;
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
