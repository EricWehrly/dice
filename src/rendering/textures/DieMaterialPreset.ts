import {
    DIE_BODY_MATERIALS,
    DIE_SURFACE_FINISHES,
    type DieBodyMaterial,
    type DieMaterialPreset,
    type DieSurfaceFinish,
    type ResolveDieMaterialPresetInput,
} from './DieTextureTypes';

const BODY_COLORS: Record<DieBodyMaterial, { backgroundColor: string; pipColor: string }> = {
    bone: { backgroundColor: '#f3e8d2', pipColor: '#2e2016' },
    wood: { backgroundColor: '#a57544', pipColor: '#22170f' },
    stone: { backgroundColor: '#c8c8c8', pipColor: '#1f1f1f' },
    ceramic: { backgroundColor: '#f5f5f2', pipColor: '#1f2c35' },
    brass: { backgroundColor: '#c89a2d', pipColor: '#2b1d05' },
    steel: { backgroundColor: '#b8c0c8', pipColor: '#1f2a33' },
    obsidian: { backgroundColor: '#1c1c22', pipColor: '#f0f0f2' },
    resin: { backgroundColor: '#d9e9ff', pipColor: '#162438' },
};

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
    const bodyMaterial: DieBodyMaterial = isBodyMaterial(input.bodyMaterial) ? input.bodyMaterial : 'bone';
    const surfaceFinish: DieSurfaceFinish = isSurfaceFinish(input.surfaceFinish) ? input.surfaceFinish : 'plain';

    const base = BODY_COLORS[bodyMaterial];
    const surface = FINISH_PROFILES[surfaceFinish];

    return {
        bodyMaterial,
        surfaceFinish,
        backgroundColor: input.fallbackBackgroundColor || base.backgroundColor,
        pipColor: input.fallbackPipColor || base.pipColor,
        surface,
    };
}
