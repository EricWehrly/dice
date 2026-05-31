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
});