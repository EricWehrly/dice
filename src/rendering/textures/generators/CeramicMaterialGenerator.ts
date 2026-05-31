import * as THREE from 'three';
import { createD6FaceAtlasTexture } from '../DieFaceTextureAtlas';
import { type MaterialTextureGenerator, type MaterialTextureGeneratorOptions } from '../MaterialTextureGenerator';
import { type DieSurfaceFinish } from '../DieTextureTypes';

type CeramicMaterial = 'ceramic';

interface CeramicFinishTuning {
    readonly speckleCountScale: number;
    readonly speckleAlpha: number;
    readonly glazeAlpha: number;
    readonly poolingAlpha: number;
    readonly edgeAlpha: number;
}

const FINISH_TUNING: Record<DieSurfaceFinish, CeramicFinishTuning> = {
    plain: {
        speckleCountScale: 0.9,
        speckleAlpha: 0.05,
        glazeAlpha: 0.06,
        poolingAlpha: 0.04,
        edgeAlpha: 0.08,
    },
    etched: {
        speckleCountScale: 1.4,
        speckleAlpha: 0.07,
        glazeAlpha: 0.03,
        poolingAlpha: 0.025,
        edgeAlpha: 0.06,
    },
    polished: {
        speckleCountScale: 0.3,
        speckleAlpha: 0.02,
        glazeAlpha: 0.1,
        poolingAlpha: 0.07,
        edgeAlpha: 0.12,
    },
    hammered: {
        speckleCountScale: 1.8,
        speckleAlpha: 0.085,
        glazeAlpha: 0.025,
        poolingAlpha: 0.015,
        edgeAlpha: 0.05,
    },
};

const ROUGHNESS_VALUES: Record<CeramicMaterial, Record<DieSurfaceFinish, number>> = {
    ceramic: {
        plain: 0.52,
        etched: 0.66,
        polished: 0.4,
        hammered: 0.72,
    },
};

export const CeramicMaterialGenerators: readonly MaterialTextureGenerator[] = (
    ['ceramic'] as const
).map((material) => createCeramicMaterialGenerator(material));

function createCeramicMaterialGenerator(material: CeramicMaterial): MaterialTextureGenerator {
    return {
        material,
        label: 'Ceramic',
        category: 'plastic',
        generateTexture(options: MaterialTextureGeneratorOptions): THREE.CanvasTexture {
            const texture = createD6FaceAtlasTexture({
                backgroundColor: options.backgroundColor,
                pipColor: options.pipColor,
                faceSize: options.faceSize,
                edgeRoundness: options.edgeRoundness,
                pipStyle: options.pipStyle,
                pipSize: options.pipSize,
            });

            applyCeramicFinish(texture, material, options.surfaceFinish, options.backgroundColor);
            return texture;
        },
        generateRoughnessMap(options: MaterialTextureGeneratorOptions): THREE.CanvasTexture {
            const faceSize = options.faceSize ?? 256;
            const canvas = document.createElement('canvas');
            const gap = Math.max(4, Math.round(faceSize * 0.05));
            canvas.width = (3 * faceSize) + (4 * gap);
            canvas.height = (2 * faceSize) + (3 * gap);

            const context = canvas.getContext('2d');
            if (!context) {
                throw new Error('Failed to create 2D canvas context for ceramic roughness texture');
            }

            const roughness = ROUGHNESS_VALUES[material][options.surfaceFinish];
            const grayscale = Math.round(clamp(roughness, 0, 1) * 255);
            context.fillStyle = `rgb(${grayscale}, ${grayscale}, ${grayscale})`;
            context.fillRect(0, 0, canvas.width, canvas.height);

            const texture = new THREE.CanvasTexture(canvas);
            texture.colorSpace = THREE.NoColorSpace;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.generateMipmaps = false;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.needsUpdate = true;
            return texture;
        },
    };
}

function applyCeramicFinish(
    texture: THREE.CanvasTexture,
    _material: CeramicMaterial,
    finish: DieSurfaceFinish,
    backgroundColor: string,
): void {
    const canvas = texture.image;
    if (!(canvas instanceof HTMLCanvasElement)) {
        return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
        return;
    }

    const tuning = FINISH_TUNING[finish];
    const width = canvas.width;
    const height = canvas.height;

    const speckleCount = Math.round(((width * height) / 2200) * tuning.speckleCountScale);
    context.fillStyle = `rgba(255, 255, 255, ${tuning.speckleAlpha.toFixed(3)})`;
    for (let index = 0; index < speckleCount; index += 1) {
        const x = Math.floor((Math.sin(index * 23.17) * 0.5 + 0.5) * width);
        const y = Math.floor((Math.cos(index * 13.91) * 0.5 + 0.5) * height);
        context.fillRect(x, y, 1, 1);
    }

    const darkSpeckleCount = Math.round(speckleCount * 0.35);
    context.fillStyle = `rgba(0, 0, 0, ${(tuning.speckleAlpha * 0.6).toFixed(3)})`;
    for (let index = 0; index < darkSpeckleCount; index += 1) {
        const x = Math.floor((Math.cos(index * 19.43) * 0.5 + 0.5) * width);
        const y = Math.floor((Math.sin(index * 7.29) * 0.5 + 0.5) * height);
        context.fillRect(x, y, 1, 2);
    }

    // Glaze sheen: vertical gradient to simulate top-lit fired surface
    const glazeGradient = context.createLinearGradient(0, 0, 0, height);
    glazeGradient.addColorStop(0, `rgba(255, 255, 255, ${tuning.glazeAlpha.toFixed(3)})`);
    glazeGradient.addColorStop(0.45, `rgba(255, 255, 255, ${(tuning.glazeAlpha * 0.15).toFixed(3)})`);
    glazeGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
    context.fillStyle = glazeGradient as unknown as string;
    context.fillRect(0, 0, width, height);

    // Pooling: subtle darker concentration at lower corners, mimics glaze pooling behavior
    context.fillStyle = `rgba(0, 0, 0, ${tuning.poolingAlpha.toFixed(3)})`;
    context.fillRect(0, Math.round(height * 0.82), width, Math.round(height * 0.18));

    // Highlight edge
    const edgeSize = Math.max(2, Math.round(Math.min(width, height) * 0.012));
    context.fillStyle = `rgba(255, 255, 255, ${tuning.edgeAlpha.toFixed(3)})`;
    context.fillRect(0, 0, width, edgeSize);
    context.fillRect(0, 0, edgeSize, height);

    texture.needsUpdate = true;
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
