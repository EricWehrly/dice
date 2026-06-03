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

type WoodMaterial = 'wood';

interface WoodFinishTuning {
    readonly grainAlpha: number;
    readonly breakupAlpha: number;
    readonly edgeAlpha: number;
    readonly inclusionAlpha: number;
}

const WOOD_FINISH_TUNING: Record<DieSurfaceFinish, WoodFinishTuning> = {
    plain: {
        grainAlpha: 0.06,
        breakupAlpha: 0.055,
        edgeAlpha: 0.05,
        inclusionAlpha: 0.016,
    },
    etched: {
        grainAlpha: 0.07,
        breakupAlpha: 0.065,
        edgeAlpha: 0.04,
        inclusionAlpha: 0.022,
    },
    polished: {
        grainAlpha: 0.03,
        breakupAlpha: 0.028,
        edgeAlpha: 0.06,
        inclusionAlpha: 0.01,
    },
    hammered: {
        grainAlpha: 0.05,
        breakupAlpha: 0.075,
        edgeAlpha: 0.035,
        inclusionAlpha: 0.026,
    },
};

const WOOD_ROUGHNESS: Record<WoodMaterial, Record<DieSurfaceFinish, number>> = {
    wood: {
        plain: 0.62,
        etched: 0.73,
        polished: 0.42,
        hammered: 0.76,
    },
};

export const WoodMaterialGenerators: readonly MaterialTextureGenerator[] = ([
    'wood',
] as const).map((material) => createWoodGenerator(material));

function createWoodGenerator(material: WoodMaterial): MaterialTextureGenerator {
    return {
        material,
        label: 'Wood',
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

            applyWoodFinish(texture, options.surfaceFinish);
            return texture;
        },
        generateRoughnessMap(options: MaterialTextureGeneratorOptions): THREE.CanvasTexture {
            return createRoughnessAuthorityMap({
                roughness: WOOD_ROUGHNESS[material][options.surfaceFinish],
                faceSize: options.faceSize ?? 256,
                grainAlpha: 0.014,
                grainStep: 7,
            });
        },
    };
}

function applyWoodFinish(texture: THREE.CanvasTexture, finish: DieSurfaceFinish): void {
    const canvas = texture.image;
    if (!(canvas instanceof HTMLCanvasElement)) {
        return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
        return;
    }

    const tuning = WOOD_FINISH_TUNING[finish];
    const width = canvas.width;
    const height = canvas.height;
    const capabilityContext = { canvas, context, width, height };

    applyMacroBreakup(capabilityContext, {
        brightColor: 'rgb(172, 138, 90)',
        darkColor: 'rgb(66, 46, 27)',
        alpha: tuning.breakupAlpha,
        bandStep: 9,
        direction: 'horizontal',
    });

    applyMicroGrain(capabilityContext, {
        color: 'rgb(122, 90, 56)',
        alpha: tuning.grainAlpha,
        step: 5,
        direction: 'horizontal',
    });

    applyInclusionParticles(capabilityContext, {
        color: 'rgb(148, 112, 72)',
        alpha: tuning.inclusionAlpha,
        densityScale: 0.35,
        minSize: 1,
        maxSize: 2,
    });

    applyEdgeBehavior(capabilityContext, {
        brightColor: 'rgb(182, 146, 98)',
        darkColor: 'rgb(63, 44, 25)',
        alpha: tuning.edgeAlpha,
    });

    texture.needsUpdate = true;
}
