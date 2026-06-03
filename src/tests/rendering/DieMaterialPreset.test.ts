import { resolveDieMaterialPreset } from '../../rendering/textures/DieMaterialPreset';
import {
    STONE_MINERAL_EFFECT_PRESETS,
    STONE_MINERAL_MATERIAL_TO_PRESET,
    STONE_MINERAL_PRESET_DEFINITIONS,
} from '../../rendering/textures/families/StoneMineralPresets';

describe('DieMaterialPreset metal overrides', () => {
    it('gives polished steel a stronger metallic response than polished plastic', () => {
        const plasticPreset = resolveDieMaterialPreset({
            bodyMaterial: 'plastic',
            surfaceFinish: 'polished',
        });
        const steelPreset = resolveDieMaterialPreset({
            bodyMaterial: 'steel',
            surfaceFinish: 'polished',
        });

        expect(steelPreset.surface.metalness).toBeGreaterThan(plasticPreset.surface.metalness);
        expect(steelPreset.surface.roughness).toBeLessThan(plasticPreset.surface.roughness);
    });

    it('keeps brass warmer and glossier than steel in polished mode', () => {
        const brassPreset = resolveDieMaterialPreset({
            bodyMaterial: 'brass',
            surfaceFinish: 'polished',
        });
        const steelPreset = resolveDieMaterialPreset({
            bodyMaterial: 'steel',
            surfaceFinish: 'polished',
        });

        expect(brassPreset.backgroundColor).toBe('#c8a15a');
        expect(steelPreset.backgroundColor).toBe('#bcc7d1');
        expect(brassPreset.surface.clearcoat).toBeGreaterThanOrEqual(steelPreset.surface.clearcoat);
    });

    it('resolves gold as a metallic material with high polished metalness', () => {
        const goldPreset = resolveDieMaterialPreset({
            bodyMaterial: 'gold',
            surfaceFinish: 'polished',
        });

        expect(goldPreset.bodyMaterial).toBe('gold');
        expect(goldPreset.backgroundColor).toBe('#d6b34d');
        expect(goldPreset.surface.metalness).toBeGreaterThan(0.95);
    });

    it('keeps polished resin glossier than polished plastic for dielectric comparison', () => {
        const plasticPreset = resolveDieMaterialPreset({
            bodyMaterial: 'plastic',
            surfaceFinish: 'polished',
        });
        const resinPreset = resolveDieMaterialPreset({
            bodyMaterial: 'resin',
            surfaceFinish: 'polished',
        });

        expect(resinPreset.surface.metalness).toBeLessThanOrEqual(0.03);
        expect(plasticPreset.surface.metalness).toBeLessThanOrEqual(0.03);
        expect(resinPreset.surface.clearcoat).toBeGreaterThan(plasticPreset.surface.clearcoat);
        expect(resinPreset.surface.roughness).toBeLessThan(plasticPreset.surface.roughness);
    });

    it('keeps ceramic fully dielectric while preserving polished-vs-hammered contrast', () => {
        const polishedCeramic = resolveDieMaterialPreset({
            bodyMaterial: 'ceramic',
            surfaceFinish: 'polished',
        });
        const hammeredCeramic = resolveDieMaterialPreset({
            bodyMaterial: 'ceramic',
            surfaceFinish: 'hammered',
        });

        expect(polishedCeramic.surface.metalness).toBe(0);
        expect(hammeredCeramic.surface.metalness).toBe(0);
        expect(polishedCeramic.surface.clearcoat).toBeGreaterThan(hammeredCeramic.surface.clearcoat);
        expect(polishedCeramic.surface.roughness).toBeLessThan(hammeredCeramic.surface.roughness);
    });

    it('maps stone materials to a bounded set of six effect presets with negative controls', () => {
        expect(STONE_MINERAL_EFFECT_PRESETS).toHaveLength(6);
        expect(STONE_MINERAL_MATERIAL_TO_PRESET.marble).toBe('wide-river-mineral');
        expect(STONE_MINERAL_MATERIAL_TO_PRESET.obsidian).toBe('glassy-dark-mineral');
        expect(STONE_MINERAL_PRESET_DEFINITIONS['narrow-river-mineral-negative'].purpose).toBe('negative');
        expect(STONE_MINERAL_PRESET_DEFINITIONS['sparse-speckle-mineral-negative'].purpose).toBe('negative');
    });

    it('keeps wide-river marble structurally broader than the narrow-river negative control', () => {
        const marblePreset = STONE_MINERAL_PRESET_DEFINITIONS['wide-river-mineral'];
        const negativePreset = STONE_MINERAL_PRESET_DEFINITIONS['narrow-river-mineral-negative'];

        expect(marblePreset.veinAmplitude).toBeGreaterThan(negativePreset.veinAmplitude);
        expect(marblePreset.veinAlpha).toBeGreaterThan(negativePreset.veinAlpha);
        expect(marblePreset.veinCount).toBeLessThan(negativePreset.veinCount);
    });

    it('keeps dense-speckle stone materially more particulate than the sparse negative control', () => {
        const targetPreset = STONE_MINERAL_PRESET_DEFINITIONS['dense-speckle-mineral'];
        const negativePreset = STONE_MINERAL_PRESET_DEFINITIONS['sparse-speckle-mineral-negative'];

        expect(targetPreset.inclusionDensityScale).toBeGreaterThan(negativePreset.inclusionDensityScale);
        expect(targetPreset.surfaceByFinish.polished.clearcoat).toBeGreaterThan(
            negativePreset.surfaceByFinish.polished.clearcoat,
        );
    });
});