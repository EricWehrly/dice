import * as THREE from 'three';

import { createD6FaceAtlasMaterialTexture, createD6FaceSurfaceDetailTexture } from '../../rendering/textures/DieFaceTextureAtlas';
import { resolveDieMaterialPreset } from '../../rendering/textures/DieMaterialPreset';
import { MaterialTextureRegistry } from '../../rendering/textures/MaterialTextureRegistry';
import { MetalMaterialGenerators } from '../../rendering/textures/generators/MetalMaterialGenerator';
import { SyntheticPolymerMaterialGenerators } from '../../rendering/textures/generators/SyntheticPolymerMaterialGenerator';
import { CeramicMaterialGenerators } from '../../rendering/textures/generators/CeramicMaterialGenerator';
import { StoneMineralMaterialGenerators } from '../../rendering/textures/generators/StoneMineralMaterialGenerator';
import { WoodMaterialGenerators } from '../../rendering/textures/generators/WoodMaterialGenerator';
import { GemGlassMaterialGenerators } from '../../rendering/textures/generators/GemGlassMaterialGenerator';

const mockCanvasContext = {
    clearRect: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    arc: () => {},
    moveTo: () => {},
    lineTo: () => {},
    fill: () => {},
    stroke: () => {},
    shadowColor: 'transparent',
    shadowBlur: 0,
    shadowOffsetY: 0,
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 0,
    lineCap: 'round' as CanvasLineCap,
    createLinearGradient: (_x0: number, _y0: number, _x1: number, _y1: number) => ({
        addColorStop: () => {},
    }),
    createRadialGradient: (_x0: number, _y0: number, _r0: number, _x1: number, _y1: number, _r1: number) => ({
        addColorStop: () => {},
    }),
};

const arcSpy = vi.spyOn(mockCanvasContext, 'arc');

if (typeof HTMLCanvasElement !== 'undefined') {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
        configurable: true,
        value: (contextId: string) => {
            if (contextId === '2d') {
                return mockCanvasContext as unknown as CanvasRenderingContext2D;
            }

            return null;
        },
    });
}

function cloneUvArray(geometry: THREE.BoxGeometry): Float32Array {
    const uvAttribute = geometry.getAttribute('uv') as THREE.BufferAttribute;
    return new Float32Array(uvAttribute.array as ArrayLike<number>);
}

describe('DieFaceTextureAtlas UV mapping', () => {
    beforeEach(() => {
        arcSpy.mockClear();
    });

    it('is stable across repeated atlas remaps on the same geometry', () => {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const before = cloneUvArray(geometry);

        const firstTexture = createD6FaceAtlasMaterialTexture({
            geometry,
            backgroundColor: '#ffffff',
            pipColor: '#000000',
            faceSize: 64,
        });
        const afterFirst = cloneUvArray(geometry);

        const secondTexture = createD6FaceAtlasMaterialTexture({
            geometry,
            backgroundColor: '#ffffff',
            pipColor: '#000000',
            faceSize: 64,
        });
        const afterSecond = cloneUvArray(geometry);

        let anyDifferenceFromBase = false;
        for (let index = 0; index < before.length; index += 1) {
            if (Math.abs(before[index] - afterFirst[index]) > 1e-6) {
                anyDifferenceFromBase = true;
                break;
            }
        }

        expect(anyDifferenceFromBase).toBe(true);

        for (let index = 0; index < afterFirst.length; index += 1) {
            expect(afterSecond[index]).toBeCloseTo(afterFirst[index], 6);
        }

        firstTexture.dispose();
        secondTexture.dispose();
        geometry.dispose();
    });

    it('keeps each remapped face spanning a meaningful UV area', () => {
        const faceSize = 64;
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        const texture = createD6FaceAtlasMaterialTexture({
            geometry,
            backgroundColor: '#ffffff',
            pipColor: '#000000',
            faceSize,
        });

        const uv = geometry.getAttribute('uv') as THREE.BufferAttribute;

        for (let faceIndex = 0; faceIndex < 6; faceIndex += 1) {
            const uValues: number[] = [];
            const vValues: number[] = [];

            for (let vertexIndex = 0; vertexIndex < 4; vertexIndex += 1) {
                const uvIndex = (faceIndex * 4) + vertexIndex;
                uValues.push(uv.getX(uvIndex));
                vValues.push(uv.getY(uvIndex));
            }

            const uSpan = Math.max(...uValues) - Math.min(...uValues);
            const vSpan = Math.max(...vValues) - Math.min(...vValues);

            expect(uSpan).toBeGreaterThan(0.2);
            expect(vSpan).toBeGreaterThan(0.2);
        }

        texture.dispose();
        geometry.dispose();
    });

    it('supports x pip style texture generation without throwing', () => {
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        const texture = createD6FaceAtlasMaterialTexture({
            geometry,
            backgroundColor: '#ffffff',
            pipColor: '#000000',
            faceSize: 64,
            pipStyle: 'x',
        });

        expect(texture).toBeDefined();
        expect(texture.image).toBeDefined();

        texture.dispose();
        geometry.dispose();
    });

    it('does not draw pips when pip size is zero', () => {
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        const texture = createD6FaceAtlasMaterialTexture({
            geometry,
            backgroundColor: '#ffffff',
            pipColor: '#000000',
            faceSize: 64,
            pipStyle: 'circle',
            pipSize: 0,
        });

        expect(texture).toBeDefined();
        expect(arcSpy).not.toHaveBeenCalled();

        texture.dispose();
        geometry.dispose();
    });

    it('uses a registered metal generator for steel atlas textures', () => {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const preset = resolveDieMaterialPreset({
            bodyMaterial: 'steel',
            surfaceFinish: 'polished',
        });

        MetalMaterialGenerators.forEach((generator) => MaterialTextureRegistry.register(generator));

        const texture = createD6FaceAtlasMaterialTexture({
            geometry,
            backgroundColor: preset.backgroundColor,
            pipColor: preset.pipColor,
            bodyMaterial: 'steel',
            surfaceFinish: 'polished',
            faceSize: 64,
        });

        expect(texture).toBeInstanceOf(THREE.CanvasTexture);

        texture.dispose();
        geometry.dispose();
        MaterialTextureRegistry.clear();
    });

    it('uses a registered metal generator for titanium atlas textures', () => {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const preset = resolveDieMaterialPreset({
            bodyMaterial: 'titanium',
            surfaceFinish: 'polished',
        });

        MetalMaterialGenerators.forEach((generator) => MaterialTextureRegistry.register(generator));

        const texture = createD6FaceAtlasMaterialTexture({
            geometry,
            backgroundColor: preset.backgroundColor,
            pipColor: preset.pipColor,
            bodyMaterial: 'titanium',
            surfaceFinish: 'polished',
            faceSize: 64,
        });

        expect(texture).toBeInstanceOf(THREE.CanvasTexture);

        texture.dispose();
        geometry.dispose();
        MaterialTextureRegistry.clear();
    });

    it('uses a registered synthetic generator for resin atlas textures', () => {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const preset = resolveDieMaterialPreset({
            bodyMaterial: 'resin',
            surfaceFinish: 'polished',
        });

        SyntheticPolymerMaterialGenerators.forEach((generator) => MaterialTextureRegistry.register(generator));

        const texture = createD6FaceAtlasMaterialTexture({
            geometry,
            backgroundColor: preset.backgroundColor,
            pipColor: preset.pipColor,
            bodyMaterial: 'resin',
            surfaceFinish: 'polished',
            faceSize: 64,
        });

        expect(texture).toBeInstanceOf(THREE.CanvasTexture);

        texture.dispose();
        geometry.dispose();
        MaterialTextureRegistry.clear();
    });

    it('uses a registered ceramic generator for ceramic atlas textures', () => {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const preset = resolveDieMaterialPreset({
            bodyMaterial: 'ceramic',
            surfaceFinish: 'polished',
        });

        CeramicMaterialGenerators.forEach((generator) => MaterialTextureRegistry.register(generator));

        const texture = createD6FaceAtlasMaterialTexture({
            geometry,
            backgroundColor: preset.backgroundColor,
            pipColor: preset.pipColor,
            bodyMaterial: 'ceramic',
            surfaceFinish: 'polished',
            faceSize: 64,
        });

        expect(texture).toBeInstanceOf(THREE.CanvasTexture);

        texture.dispose();
        geometry.dispose();
        MaterialTextureRegistry.clear();
    });

    it('uses a registered stone/mineral generator for obsidian atlas textures', () => {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const preset = resolveDieMaterialPreset({
            bodyMaterial: 'obsidian',
            surfaceFinish: 'polished',
        });

        StoneMineralMaterialGenerators.forEach((generator) => MaterialTextureRegistry.register(generator));

        const texture = createD6FaceAtlasMaterialTexture({
            geometry,
            backgroundColor: preset.backgroundColor,
            pipColor: preset.pipColor,
            bodyMaterial: 'obsidian',
            surfaceFinish: 'polished',
            faceSize: 64,
        });

        expect(texture).toBeInstanceOf(THREE.CanvasTexture);

        texture.dispose();
        geometry.dispose();
        MaterialTextureRegistry.clear();
    });

    it('uses a registered wood generator for wood atlas textures', () => {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const preset = resolveDieMaterialPreset({
            bodyMaterial: 'wood',
            surfaceFinish: 'etched',
        });

        WoodMaterialGenerators.forEach((generator) => MaterialTextureRegistry.register(generator));

        const texture = createD6FaceAtlasMaterialTexture({
            geometry,
            backgroundColor: preset.backgroundColor,
            pipColor: preset.pipColor,
            bodyMaterial: 'wood',
            surfaceFinish: 'etched',
            faceSize: 64,
        });

        expect(texture).toBeInstanceOf(THREE.CanvasTexture);

        texture.dispose();
        geometry.dispose();
        MaterialTextureRegistry.clear();
    });

    it('uses a registered gem/glass generator for crystal atlas textures', () => {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const preset = resolveDieMaterialPreset({
            bodyMaterial: 'crystal',
            surfaceFinish: 'polished',
        });

        GemGlassMaterialGenerators.forEach((generator) => MaterialTextureRegistry.register(generator));

        const texture = createD6FaceAtlasMaterialTexture({
            geometry,
            backgroundColor: preset.backgroundColor,
            pipColor: preset.pipColor,
            bodyMaterial: 'crystal',
            surfaceFinish: 'polished',
            faceSize: 64,
        });

        expect(texture).toBeInstanceOf(THREE.CanvasTexture);

        texture.dispose();
        geometry.dispose();
        MaterialTextureRegistry.clear();
    });

    it('creates a bump surface-detail texture for d6', () => {
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        const texture = createD6FaceSurfaceDetailTexture({
            kind: 'bump',
            geometry,
            backgroundColor: '#ffffff',
            pipColor: '#000000',
            faceSize: 64,
            surfaceFinish: 'plain',
        });

        expect(texture).toBeInstanceOf(THREE.CanvasTexture);
        texture.dispose();
        geometry.dispose();
    });

    it('creates a roughness surface-detail texture for d6', () => {
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        const texture = createD6FaceSurfaceDetailTexture({
            kind: 'roughness',
            geometry,
            backgroundColor: '#ffffff',
            pipColor: '#000000',
            faceSize: 64,
            surfaceFinish: 'etched',
        });

        expect(texture).toBeInstanceOf(THREE.CanvasTexture);
        texture.dispose();
        geometry.dispose();
    });
});
