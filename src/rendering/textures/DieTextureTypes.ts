export const DIE_BODY_MATERIALS = [
    'plastic',
    'wood',
    'stone',
    'ceramic',
    'resin',
    'brass',
    'steel',
    'obsidian',
    'jade',
    'glass',
    'crystal',
] as const;

export const DIE_SURFACE_FINISHES = [
    'plain',
    'etched',
    'polished',
    'hammered',
] as const;

export type DieBodyMaterial = typeof DIE_BODY_MATERIALS[number];
export type DieSurfaceFinish = typeof DIE_SURFACE_FINISHES[number];

export interface DieSurfaceProfile {
    readonly roughness: number;
    readonly metalness: number;
    readonly clearcoat: number;
    readonly clearcoatRoughness: number;
}

export interface DieMaterialPreset {
    readonly bodyMaterial: DieBodyMaterial;
    readonly surfaceFinish: DieSurfaceFinish;
    readonly backgroundColor: string;
    readonly pipColor: string;
    readonly surface: DieSurfaceProfile;
}

export interface ResolveDieMaterialPresetInput {
    readonly bodyMaterial?: string;
    readonly surfaceFinish?: string;
    readonly fallbackBackgroundColor?: string;
    readonly fallbackPipColor?: string;
}
