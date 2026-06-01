import * as THREE from 'three';
import { createD6FaceAtlasTexture } from '../DieFaceTextureAtlas';
import { type MaterialTextureGenerator, type MaterialTextureGeneratorOptions } from '../MaterialTextureGenerator';
import { type DieSurfaceFinish } from '../DieTextureTypes';
import {
    applyEdgeBehavior,
    applyInclusionParticles,
    applyMacroBreakup,
    applyMicroGrain,
    createRoughnessAuthorityMap,
} from '../capabilities';

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
        brushAlpha: 0.02,
        crossAlpha: 0.004,
        sweepAlpha: 0.03,
        sweepWidth: 0.02,
        edgeAlpha: 0.03,
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
        category: 'metal',
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
            const roughness = resolveMetalRoughness(material, options.surfaceFinish);
            return createRoughnessAuthorityMap({
                roughness,
                faceSize: options.faceSize ?? 256,
                grainAlpha: 0.01,
                grainStep: 8,
            });
        },
    };
}

function resolveMetalRoughness(_material: MetalMaterial, finish: DieSurfaceFinish): number {
    // Near-black grayscale values preserve shine on metal
    // Lower values = smoother/shinier, higher = rougher
    const finishAdjustment: Record<DieSurfaceFinish, number> = {
        plain: 0.16,
        etched: 0.24,
        polished: 0.1,
        hammered: 0.2,
    };

    return finishAdjustment[finish];
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

    const isPolished = finish === 'polished';

    const capabilityContext = { canvas, context, width, height };

    applyMicroGrain(capabilityContext, {
        color: `rgb(${appearance.brightColor})`,
        alpha: clampAlpha(tuning.brushAlpha * (isPolished ? 0.35 : 1)),
        step: tuning.brushStep,
        direction: appearance.brushDirection === 'horizontal' ? 'horizontal' : 'diagonal',
    });

    applyMacroBreakup(capabilityContext, {
        brightColor: `rgb(${appearance.brightColor})`,
        darkColor: `rgb(${appearance.darkColor})`,
        alpha: clampAlpha(tuning.crossAlpha * (isPolished ? 0.35 : 1)),
        bandStep: tuning.brushStep * 2,
        direction: 'vertical',
    });

    if (!isPolished) {
        applyMacroBreakup(capabilityContext, {
            brightColor: `rgb(${appearance.sweepColor})`,
            alpha: clampAlpha(tuning.sweepAlpha),
            bandStep: Math.max(4, Math.round(width * tuning.sweepWidth * 0.2)),
            direction: 'vertical',
        });
    }

    applyEdgeBehavior(capabilityContext, {
        brightColor: `rgb(${appearance.brightColor})`,
        darkColor: `rgb(${appearance.darkColor})`,
        alpha: clampAlpha(tuning.edgeAlpha * (isPolished ? 0.35 : 1)),
    });

    applyInclusionParticles(capabilityContext, {
        color: `rgb(${appearance.sweepColor})`,
        alpha: clampAlpha(0.01 * (isPolished ? 0.5 : 1)),
        densityScale: isPolished ? 0.25 : 0.5,
        minSize: 1,
        maxSize: 1,
    });

    texture.needsUpdate = true;
}

function clampAlpha(value: number): number {
    return Math.max(0, Math.min(0.18, value));
}