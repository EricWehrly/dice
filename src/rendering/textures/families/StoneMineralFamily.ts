import type { DieBodyMaterial, DieMaterialPreset, DieSurfaceFinish } from '../DieTextureTypes';
import {
    STONE_MINERALS,
    type StoneMineralMaterial,
    STONE_MINERAL_PRESET_DEFINITIONS,
    resolveStoneMineralEffectPreset,
} from './StoneMineralPresets';

const STONE_MINERAL_SURFACE_OVERRIDES: Record<StoneMineralMaterial, Record<DieSurfaceFinish, Partial<DieMaterialPreset['surface']>>> =
    Object.fromEntries(
        STONE_MINERALS.map((material) => {
            const preset = STONE_MINERAL_PRESET_DEFINITIONS[resolveStoneMineralEffectPreset(material)];
            return [material, preset.surfaceByFinish];
        }),
    ) as Record<StoneMineralMaterial, Record<DieSurfaceFinish, Partial<DieMaterialPreset['surface']>>>;

export function resolveStoneMineralProfile(material: DieBodyMaterial, finish: DieSurfaceFinish): Partial<DieMaterialPreset['surface']> | null {
    if (!STONE_MINERALS.includes(material as StoneMineralMaterial)) {
        return null;
    }
    return STONE_MINERAL_SURFACE_OVERRIDES[material as StoneMineralMaterial][finish] ?? null;
}
