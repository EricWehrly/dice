import * as THREE from 'three';
import { createD6FaceAtlasTexture } from '../DieFaceTextureAtlas';
import { type MaterialTextureGenerator, type MaterialTextureGeneratorOptions } from '../MaterialTextureGenerator';
import { type DieSurfaceFinish } from '../DieTextureTypes';
import {
    applyEdgeBehavior,
    applyInclusionParticles,
    applyMacroBreakup,
    applyVeinMask,
    createRoughnessAuthorityMap,
} from '../capabilities';

type StoneMaterial = 'stone' | 'obsidian' | 'jade';

interface StoneFinishTuning {
    readonly breakupAlpha: number;
    readonly veinAlpha: number;
    readonly edgeAlpha: number;
    readonly inclusionAlpha: number;
}

interface StoneAppearance {
    readonly brightColor: string;
    readonly darkColor: string;
    readonly veinColor: string;
    readonly inclusionColor: string;
}

const MATERIAL_LABELS: Record<StoneMaterial, string> = {
    stone: 'Stone',
    obsidian: 'Obsidian',
    jade: 'Jade',
};

const APPEARANCE: Record<StoneMaterial, StoneAppearance> = {
    stone: {
        brightColor: '211, 211, 211',
        darkColor: '92, 92, 92',
        veinColor: '186, 186, 186',
        inclusionColor: '233, 233, 233',
    },
    obsidian: {
        brightColor: '87, 95, 106',
        darkColor: '20, 20, 24',
        veinColor: '112, 122, 139',
        inclusionColor: '148, 160, 176',
    },
    jade: {
        brightColor: '110, 168, 126',
        darkColor: '39, 83, 53',
        veinColor: '141, 204, 164',
        inclusionColor: '191, 230, 199',
    },
};

const FINISH_TUNING: Record<DieSurfaceFinish, StoneFinishTuning> = {
    plain: {
        breakupAlpha: 0.065,
        veinAlpha: 0.05,
        edgeAlpha: 0.045,
        inclusionAlpha: 0.015,
    },
    etched: {
        breakupAlpha: 0.078,
        veinAlpha: 0.06,
        edgeAlpha: 0.035,
        inclusionAlpha: 0.022,
    },
    polished: {
        breakupAlpha: 0.04,
        veinAlpha: 0.035,
        edgeAlpha: 0.06,
        inclusionAlpha: 0.01,
    },
    hammered: {
        breakupAlpha: 0.085,
        veinAlpha: 0.07,
        edgeAlpha: 0.03,
        inclusionAlpha: 0.028,
    },
};

const ROUGHNESS_VALUES: Record<StoneMaterial, Record<DieSurfaceFinish, number>> = {
    stone: {
        plain: 0.71,
        etched: 0.79,
        polished: 0.52,
        hammered: 0.82,
    },
    obsidian: {
        plain: 0.55,
        etched: 0.62,
        polished: 0.31,
        hammered: 0.67,
    },
    jade: {
        plain: 0.49,
        etched: 0.58,
        polished: 0.35,
        hammered: 0.63,
    },
};

export const StoneMineralMaterialGenerators: readonly MaterialTextureGenerator[] = ([
    'stone',
    'obsidian',
    'jade',
] as const).map((material) => createStoneGenerator(material));

function createStoneGenerator(material: StoneMaterial): MaterialTextureGenerator {
    return {
        material,
        label: MATERIAL_LABELS[material],
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

            applyStoneFinish(texture, material, options.surfaceFinish);
            return texture;
        },
        generateRoughnessMap(options: MaterialTextureGeneratorOptions): THREE.CanvasTexture {
            return createRoughnessAuthorityMap({
                roughness: ROUGHNESS_VALUES[material][options.surfaceFinish],
                faceSize: options.faceSize ?? 256,
                grainAlpha: 0.014,
                grainStep: 6,
            });
        },
    };
}

function applyStoneFinish(texture: THREE.CanvasTexture, material: StoneMaterial, finish: DieSurfaceFinish): void {
    const canvas = texture.image;
    if (!(canvas instanceof HTMLCanvasElement)) {
        return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
        return;
    }

    const tuning = FINISH_TUNING[finish];
    const appearance = APPEARANCE[material];
    const width = canvas.width;
    const height = canvas.height;
    const capabilityContext = { canvas, context, width, height };

    applyMacroBreakup(capabilityContext, {
        brightColor: `rgb(${appearance.brightColor})`,
        darkColor: `rgb(${appearance.darkColor})`,
        alpha: tuning.breakupAlpha,
        bandStep: 10,
        direction: material === 'stone' ? 'horizontal' : 'diagonal',
    });

    applyVeinMask(capabilityContext, {
        color: `rgb(${appearance.veinColor})`,
        alpha: tuning.veinAlpha,
        veinCount: material === 'stone' ? 6 : 5,
        amplitude: material === 'jade' ? 14 : 10,
    });

    applyInclusionParticles(capabilityContext, {
        color: `rgb(${appearance.inclusionColor})`,
        alpha: tuning.inclusionAlpha,
        densityScale: material === 'stone' ? 0.8 : 0.45,
        minSize: 1,
        maxSize: 2,
    });

    applyEdgeBehavior(capabilityContext, {
        brightColor: `rgb(${appearance.brightColor})`,
        darkColor: `rgb(${appearance.darkColor})`,
        alpha: tuning.edgeAlpha,
    });

    texture.needsUpdate = true;
}
