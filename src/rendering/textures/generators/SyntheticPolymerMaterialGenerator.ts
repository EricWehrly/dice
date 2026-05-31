import * as THREE from 'three';
import { createD6FaceAtlasTexture } from '../DieFaceTextureAtlas';
import { type MaterialTextureGenerator, type MaterialTextureGeneratorOptions } from '../MaterialTextureGenerator';
import { type DieSurfaceFinish } from '../DieTextureTypes';

type SyntheticMaterial = 'plastic' | 'resin';

interface SyntheticAppearanceProfile {
    readonly speckleColor: string;
    readonly streakColor: string;
    readonly edgeColor: string;
}

interface SyntheticFinishTuning {
    readonly speckleCountScale: number;
    readonly speckleAlpha: number;
    readonly streakAlpha: number;
    readonly edgeAlpha: number;
}

const SYNTHETIC_LABELS: Record<SyntheticMaterial, string> = {
    plastic: 'Plastic',
    resin: 'Resin',
};

const SYNTHETIC_APPEARANCE: Record<SyntheticMaterial, SyntheticAppearanceProfile> = {
    plastic: {
        speckleColor: '255, 255, 255',
        streakColor: '255, 255, 255',
        edgeColor: '246, 250, 255',
    },
    resin: {
        speckleColor: '255, 236, 214',
        streakColor: '255, 244, 228',
        edgeColor: '255, 242, 224',
    },
};

const FINISH_TUNING: Record<DieSurfaceFinish, SyntheticFinishTuning> = {
    plain: {
        speckleCountScale: 1,
        speckleAlpha: 0.06,
        streakAlpha: 0.045,
        edgeAlpha: 0.07,
    },
    etched: {
        speckleCountScale: 1.3,
        speckleAlpha: 0.075,
        streakAlpha: 0.03,
        edgeAlpha: 0.05,
    },
    polished: {
        speckleCountScale: 0.45,
        speckleAlpha: 0.025,
        streakAlpha: 0.05,
        edgeAlpha: 0.09,
    },
    hammered: {
        speckleCountScale: 1.6,
        speckleAlpha: 0.09,
        streakAlpha: 0.02,
        edgeAlpha: 0.045,
    },
};

const ROUGHNESS_VALUES: Record<SyntheticMaterial, Record<DieSurfaceFinish, number>> = {
    plastic: {
        plain: 0.58,
        etched: 0.69,
        polished: 0.46,
        hammered: 0.74,
    },
    resin: {
        plain: 0.47,
        etched: 0.56,
        polished: 0.33,
        hammered: 0.63,
    },
};

export const SyntheticPolymerMaterialGenerators: readonly MaterialTextureGenerator[] = ([
    'plastic',
    'resin',
] as const).map((material) => createSyntheticMaterialGenerator(material));

function createSyntheticMaterialGenerator(material: SyntheticMaterial): MaterialTextureGenerator {
    return {
        material,
        label: SYNTHETIC_LABELS[material],
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

            applySyntheticFinish(texture, material, options.surfaceFinish);
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
                throw new Error('Failed to create 2D canvas context for synthetic roughness texture');
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

function applySyntheticFinish(texture: THREE.CanvasTexture, material: SyntheticMaterial, finish: DieSurfaceFinish): void {
    const canvas = texture.image;
    if (!(canvas instanceof HTMLCanvasElement)) {
        return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
        return;
    }

    const tuning = FINISH_TUNING[finish];
    const appearance = SYNTHETIC_APPEARANCE[material];
    const width = canvas.width;
    const height = canvas.height;

    const speckleCount = Math.round(((width * height) / 1800) * tuning.speckleCountScale);
    context.fillStyle = `rgba(${appearance.speckleColor}, ${tuning.speckleAlpha.toFixed(3)})`;
    for (let index = 0; index < speckleCount; index += 1) {
        const x = Math.floor((Math.sin(index * 17.11) * 0.5 + 0.5) * width);
        const y = Math.floor((Math.cos(index * 11.73) * 0.5 + 0.5) * height);
        const radius = 1 + (index % 2);
        context.fillRect(x, y, radius, radius);
    }

    context.strokeStyle = `rgba(${appearance.streakColor}, ${tuning.streakAlpha.toFixed(3)})`;
    context.lineWidth = 1;
    for (let y = 0; y < height; y += 6) {
        const wave = Math.sin(y * 0.032 + (material === 'resin' ? 0.8 : 0.25));
        const offset = wave * 5;
        context.beginPath();
        context.moveTo(0, y + offset);
        context.lineTo(width, y - (offset * 0.4));
        context.stroke();
    }

    const edgeSize = Math.max(2, Math.round(Math.min(width, height) * 0.01));
    context.fillStyle = `rgba(${appearance.edgeColor}, ${tuning.edgeAlpha.toFixed(3)})`;
    context.fillRect(0, 0, width, edgeSize);
    context.fillRect(0, 0, edgeSize, height);

    texture.needsUpdate = true;
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}