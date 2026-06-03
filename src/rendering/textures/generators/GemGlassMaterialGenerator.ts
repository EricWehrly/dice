import * as THREE from 'three';
import { createD6FaceAtlasTexture } from '../DieFaceTextureAtlas';
import { type MaterialTextureGenerator, type MaterialTextureGeneratorOptions } from '../MaterialTextureGenerator';
import { type DieSurfaceFinish } from '../DieTextureTypes';
import {
    applyDepthAttenuation,
    applyEdgeBehavior,
    applyGlazeLayer,
    applyInclusionParticles,
    applyMacroBreakup,
    applyMicroGrain,
    createRoughnessAuthorityMap,
} from '../capabilities';

type GemGlassMaterial = 'glass' | 'crystal';

interface GemFinishTuning {
    readonly macroAlpha: number;
    readonly grainAlpha: number;
    readonly glazeAlpha: number;
    readonly depthAlpha: number;
    readonly edgeAlpha: number;
    readonly inclusionAlpha: number;
}

interface GemAppearance {
    readonly brightColor: string;
    readonly darkColor: string;
    readonly accentColor: string;
}

const GEM_LABELS: Record<GemGlassMaterial, string> = {
    glass: 'Glass',
    crystal: 'Crystal',
};

const GEM_APPEARANCE: Record<GemGlassMaterial, GemAppearance> = {
    glass: {
        brightColor: '232, 244, 255',
        darkColor: '154, 183, 206',
        accentColor: '208, 228, 246',
    },
    crystal: {
        brightColor: '243, 250, 255',
        darkColor: '169, 188, 209',
        accentColor: '226, 238, 250',
    },
};

const GEM_FINISH_TUNING: Record<DieSurfaceFinish, GemFinishTuning> = {
    plain: {
        macroAlpha: 0.06,
        grainAlpha: 0.05,
        glazeAlpha: 0.05,
        depthAlpha: 0.06,
        edgeAlpha: 0.06,
        inclusionAlpha: 0.015,
    },
    etched: {
        macroAlpha: 0.07,
        grainAlpha: 0.06,
        glazeAlpha: 0.03,
        depthAlpha: 0.05,
        edgeAlpha: 0.045,
        inclusionAlpha: 0.02,
    },
    polished: {
        macroAlpha: 0.035,
        grainAlpha: 0.022,
        glazeAlpha: 0.08,
        depthAlpha: 0.09,
        edgeAlpha: 0.085,
        inclusionAlpha: 0.01,
    },
    hammered: {
        macroAlpha: 0.08,
        grainAlpha: 0.04,
        glazeAlpha: 0.02,
        depthAlpha: 0.045,
        edgeAlpha: 0.04,
        inclusionAlpha: 0.03,
    },
};

const GEM_ROUGHNESS: Record<GemGlassMaterial, Record<DieSurfaceFinish, number>> = {
    glass: {
        plain: 0.22,
        etched: 0.34,
        polished: 0.1,
        hammered: 0.38,
    },
    crystal: {
        plain: 0.18,
        etched: 0.3,
        polished: 0.07,
        hammered: 0.34,
    },
};

export const GemGlassMaterialGenerators: readonly MaterialTextureGenerator[] = ([
    'glass',
    'crystal',
] as const).map((material) => createGemGenerator(material));

function createGemGenerator(material: GemGlassMaterial): MaterialTextureGenerator {
    return {
        material,
        label: GEM_LABELS[material],
        category: 'premium',
        generateTexture(options: MaterialTextureGeneratorOptions): THREE.CanvasTexture {
            const texture = createD6FaceAtlasTexture({
                backgroundColor: options.backgroundColor,
                pipColor: options.pipColor,
                faceSize: options.faceSize,
                edgeRoundness: options.edgeRoundness,
                pipStyle: options.pipStyle,
                pipSize: options.pipSize,
            });

            applyGemFinish(texture, material, options.surfaceFinish);
            return texture;
        },
        generateRoughnessMap(options: MaterialTextureGeneratorOptions): THREE.CanvasTexture {
            return createRoughnessAuthorityMap({
                roughness: GEM_ROUGHNESS[material][options.surfaceFinish],
                faceSize: options.faceSize ?? 256,
                grainAlpha: 0.008,
                grainStep: 9,
            });
        },
    };
}

function applyGemFinish(texture: THREE.CanvasTexture, material: GemGlassMaterial, finish: DieSurfaceFinish): void {
    const canvas = texture.image;
    if (!(canvas instanceof HTMLCanvasElement)) {
        return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
        return;
    }

    const tuning = GEM_FINISH_TUNING[finish];
    const appearance = GEM_APPEARANCE[material];
    const width = canvas.width;
    const height = canvas.height;
    const capabilityContext = { canvas, context, width, height };

    applyMacroBreakup(capabilityContext, {
        brightColor: `rgb(${appearance.brightColor})`,
        darkColor: `rgb(${appearance.darkColor})`,
        alpha: tuning.macroAlpha,
        bandStep: 12,
        direction: 'diagonal',
    });

    applyMicroGrain(capabilityContext, {
        color: `rgb(${appearance.accentColor})`,
        alpha: tuning.grainAlpha,
        step: 8,
        direction: 'diagonal',
    });

    applyGlazeLayer(capabilityContext, {
        alpha: tuning.glazeAlpha,
        poolingAlpha: tuning.glazeAlpha * 0.45,
    });

    applyDepthAttenuation(capabilityContext, {
        centerColor: `rgb(${appearance.brightColor})`,
        edgeColor: `rgb(${appearance.darkColor})`,
        alpha: tuning.depthAlpha,
        radiusScale: material === 'crystal' ? 0.88 : 0.93,
    });

    applyInclusionParticles(capabilityContext, {
        color: `rgb(${appearance.accentColor})`,
        alpha: tuning.inclusionAlpha,
        densityScale: 0.2,
        minSize: 1,
        maxSize: 1,
    });

    applyEdgeBehavior(capabilityContext, {
        brightColor: `rgb(${appearance.brightColor})`,
        darkColor: `rgb(${appearance.darkColor})`,
        alpha: tuning.edgeAlpha,
    });

    texture.needsUpdate = true;
}
