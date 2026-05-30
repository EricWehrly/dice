import * as THREE from 'three';
import { createD6FaceAtlasTexture } from '../DieFaceTextureAtlas';
import { type MaterialTextureGenerator, type MaterialTextureGeneratorOptions } from '../MaterialTextureGenerator';
import { type DieSurfaceFinish } from '../DieTextureTypes';

type MetalMaterial = 'brass' | 'steel' | 'gold' | 'silver' | 'bronze' | 'copper' | 'iron' | 'titanium';

interface MetalFinishTuning {
    readonly brushStep: number;
    readonly brushAlpha: number;
    readonly crossAlpha: number;
    readonly sweepAlpha: number;
    readonly sweepWidth: number;
    readonly edgeAlpha: number;
}

interface MetalAppearanceProfile {
    readonly brightColor: string;
    readonly darkColor: string;
    readonly sweepColor: string;
    readonly brushDirection: 'horizontal' | 'diagonal';
}

const METAL_LABELS: Record<MetalMaterial, string> = {
    brass: 'Brass',
    steel: 'Steel',
    gold: 'Gold',
    silver: 'Silver',
    bronze: 'Bronze',
    copper: 'Copper',
    iron: 'Iron',
    titanium: 'Titanium',
};

const METAL_APPEARANCE: Record<MetalMaterial, MetalAppearanceProfile> = {
    brass: {
        brightColor: '255, 236, 178',
        darkColor: '74, 47, 20',
        sweepColor: '255, 214, 128',
        brushDirection: 'diagonal',
    },
    steel: {
        brightColor: '247, 251, 255',
        darkColor: '52, 66, 82',
        sweepColor: '220, 236, 255',
        brushDirection: 'horizontal',
    },
    gold: {
        brightColor: '255, 242, 173',
        darkColor: '92, 71, 27',
        sweepColor: '255, 225, 120',
        brushDirection: 'diagonal',
    },
    silver: {
        brightColor: '246, 250, 255',
        darkColor: '63, 74, 89',
        sweepColor: '229, 239, 253',
        brushDirection: 'horizontal',
    },
    bronze: {
        brightColor: '225, 180, 136',
        darkColor: '79, 50, 31',
        sweepColor: '214, 153, 110',
        brushDirection: 'diagonal',
    },
    copper: {
        brightColor: '236, 167, 127',
        darkColor: '90, 52, 33',
        sweepColor: '230, 145, 101',
        brushDirection: 'diagonal',
    },
    iron: {
        brightColor: '178, 188, 201',
        darkColor: '37, 45, 56',
        sweepColor: '136, 145, 158',
        brushDirection: 'horizontal',
    },
    titanium: {
        brightColor: '209, 221, 238',
        darkColor: '47, 62, 79',
        sweepColor: '184, 203, 229',
        brushDirection: 'horizontal',
    },
};

const FINISH_TUNING: Record<DieSurfaceFinish, MetalFinishTuning> = {
    plain: {
        brushStep: 3,
        brushAlpha: 0.075,
        crossAlpha: 0.03,
        sweepAlpha: 0.12,
        sweepWidth: 0.08,
        edgeAlpha: 0.08,
    },
    etched: {
        brushStep: 4,
        brushAlpha: 0.06,
        crossAlpha: 0.05,
        sweepAlpha: 0.08,
        sweepWidth: 0.05,
        edgeAlpha: 0.07,
    },
    polished: {
        brushStep: 2,
        brushAlpha: 0.11,
        crossAlpha: 0.015,
        sweepAlpha: 0.2,
        sweepWidth: 0.12,
        edgeAlpha: 0.16,
    },
    hammered: {
        brushStep: 6,
        brushAlpha: 0.05,
        crossAlpha: 0.08,
        sweepAlpha: 0.06,
        sweepWidth: 0.04,
        edgeAlpha: 0.06,
    },
};

export const MetalMaterialGenerators: readonly MaterialTextureGenerator[] = ([
    'brass',
    'steel',
    'gold',
    'silver',
    'bronze',
    'copper',
    'iron',
    'titanium',
] as const).map((material) => createMetalMaterialGenerator(material));

function createMetalMaterialGenerator(material: MetalMaterial): MaterialTextureGenerator {
    return {
        material,
        label: METAL_LABELS[material],
        generateTexture(options: MaterialTextureGeneratorOptions): THREE.CanvasTexture {
            const texture = createD6FaceAtlasTexture({
                backgroundColor: options.backgroundColor,
                pipColor: options.pipColor,
                faceSize: options.faceSize,
                edgeRoundness: options.edgeRoundness,
                pipStyle: options.pipStyle,
                pipSize: options.pipSize,
            });

            applyMetalFinish(texture, material, options.surfaceFinish);
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
                throw new Error('Failed to create 2D canvas context for metal roughness texture');
            }

            // Metal is polished/smooth by default: near-black (0.05-0.15 range)
            // Darker values = smoother surface, which preserves specular highlights
            const roughness = resolveMetalRoughness(material, options.surfaceFinish);
            context.fillStyle = roughness;
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

function resolveMetalRoughness(material: MetalMaterial, finish: DieSurfaceFinish): string {
    // Near-black grayscale values preserve shine on metal
    // Lower values = smoother/shinier, higher = rougher
    const finishAdjustment: Record<DieSurfaceFinish, number> = {
        plain: 0.16,
        etched: 0.24,
        polished: 0.1,
        hammered: 0.2,
    };

    const roughnessValue = finishAdjustment[finish];
    const grayscale = Math.round(roughnessValue * 255);
    return `rgb(${grayscale}, ${grayscale}, ${grayscale})`;
}

function applyMetalFinish(texture: THREE.CanvasTexture, material: MetalMaterial, finish: DieSurfaceFinish): void {
    const canvas = texture.image;
    if (!(canvas instanceof HTMLCanvasElement)) {
        return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
        return;
    }

    const tuning = FINISH_TUNING[finish];
    const appearance = METAL_APPEARANCE[material];
    const width = canvas.width;
    const height = canvas.height;

    if (appearance.brushDirection === 'horizontal') {
        for (let y = 0; y < height; y += tuning.brushStep) {
            const wave = Math.sin(y * 0.11) + Math.cos(y * 0.037);
            const alpha = clampAlpha((0.5 + wave * 0.25) * tuning.brushAlpha);
            context.fillStyle = `rgba(${appearance.brightColor}, ${alpha.toFixed(3)})`;
            context.fillRect(0, y, width, 1);
        }
    } else {
        for (let y = 0; y < height; y += 1) {
            const diagonalOffset = Math.round((Math.sin(y * 0.045) + 1) * width * 0.08);
            const alpha = clampAlpha((0.45 + Math.cos(y * 0.028) * 0.2) * tuning.brushAlpha);
            context.fillStyle = `rgba(${appearance.brightColor}, ${alpha.toFixed(3)})`;
            for (let x = -diagonalOffset; x < width; x += tuning.brushStep * 4) {
                context.fillRect(x + diagonalOffset, y, tuning.brushStep * 2, 1);
            }
        }
    }

    for (let x = 0; x < width; x += tuning.brushStep * 2) {
        const wave = Math.cos(x * 0.09) + Math.sin(x * 0.031);
        const alpha = clampAlpha((0.45 + wave * 0.18) * tuning.crossAlpha);
        context.fillStyle = `rgba(${appearance.darkColor}, ${alpha.toFixed(3)})`;
        context.fillRect(x, 0, 1, height);
    }

    const sweepWidth = Math.max(8, Math.round(width * tuning.sweepWidth));
    const primarySweepX = Math.round(width * 0.24);
    const secondarySweepX = Math.round(width * 0.67);
    context.fillStyle = `rgba(${appearance.sweepColor}, ${tuning.sweepAlpha.toFixed(3)})`;
    context.fillRect(primarySweepX, 0, sweepWidth, height);
    context.fillRect(secondarySweepX, 0, Math.max(4, Math.round(sweepWidth * 0.55)), height);

    const edgeSize = Math.max(2, Math.round(Math.min(width, height) * 0.012));
    context.fillStyle = `rgba(${appearance.brightColor}, ${tuning.edgeAlpha.toFixed(3)})`;
    context.fillRect(0, 0, width, edgeSize);
    context.fillRect(0, 0, edgeSize, height);

    context.fillStyle = `rgba(${appearance.darkColor}, ${(tuning.edgeAlpha * 0.85).toFixed(3)})`;
    context.fillRect(0, height - edgeSize, width, edgeSize);
    context.fillRect(width - edgeSize, 0, edgeSize, height);

    texture.needsUpdate = true;
}

function clampAlpha(value: number): number {
    return Math.max(0, Math.min(0.18, value));
}