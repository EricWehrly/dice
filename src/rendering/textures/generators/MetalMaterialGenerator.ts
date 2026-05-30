import * as THREE from 'three';
import { createD6FaceAtlasTexture } from '../DieFaceTextureAtlas';
import { type MaterialTextureGenerator, type MaterialTextureGeneratorOptions } from '../MaterialTextureGenerator';
import { type DieSurfaceFinish } from '../DieTextureTypes';

type MetalMaterial = 'brass' | 'steel';

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
    };
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