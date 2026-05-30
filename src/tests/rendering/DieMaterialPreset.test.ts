import { resolveDieMaterialPreset } from '../../rendering/textures/DieMaterialPreset';

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
});