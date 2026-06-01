import * as THREE from 'three';
import { createD6FaceAtlasTexture } from '../DieFaceTextureAtlas';
import { type MaterialTextureGenerator, type MaterialTextureGeneratorOptions } from '../MaterialTextureGenerator';
import { type DieSurfaceFinish } from '../DieTextureTypes';
import {
    applyEdgeBehavior,
    applyGlazeLayer,
    applyInclusionParticles,
    applyMacroBreakup,
    createRoughnessAuthorityMap,
} from '../capabilities';

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
            const roughness = ROUGHNESS_VALUES[material][options.surfaceFinish];
            return createRoughnessAuthorityMap({
                roughness,
                faceSize: options.faceSize ?? 256,
                grainAlpha: 0.012,
                grainStep: 7,
            });
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

    const capabilityContext = { canvas, context, width, height };

    applyMacroBreakup(capabilityContext, {
        brightColor: 'rgb(255, 255, 255)',
        darkColor: 'rgb(0, 0, 0)',
        alpha: tuning.speckleAlpha * 0.75,
        bandStep: 11,
        direction: 'horizontal',
    });

    applyInclusionParticles(capabilityContext, {
        color: 'rgb(255, 255, 255)',
        alpha: tuning.speckleAlpha,
        densityScale: tuning.speckleCountScale,
        minSize: 1,
        maxSize: 2,
    });

    applyGlazeLayer(capabilityContext, {
        alpha: tuning.glazeAlpha,
        poolingAlpha: tuning.poolingAlpha,
    });

    applyEdgeBehavior(capabilityContext, {
        brightColor: 'rgb(255, 255, 255)',
        alpha: tuning.edgeAlpha,
    });

    texture.needsUpdate = true;
}
