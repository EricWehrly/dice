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
import {
    STONE_MINERALS,
    type StoneMineralMaterial as StoneMaterial,
    STONE_MINERAL_PRESET_DEFINITIONS,
    resolveStoneMineralEffectPreset,
} from '../families/StoneMineralPresets';

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
    marble: 'Marble',
    granite: 'Granite',
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
    marble: {
        brightColor: '246, 242, 238',
        darkColor: '192, 188, 184',
        veinColor: '148, 144, 140',
        inclusionColor: '218, 214, 210',
    },
    granite: {
        brightColor: '196, 180, 168',
        darkColor: '82, 72, 66',
        veinColor: '140, 106, 94',
        inclusionColor: '224, 216, 208',
    },
};

export const StoneMineralMaterialGenerators: readonly MaterialTextureGenerator[] = ([
    'stone',
    'obsidian',
    'jade',
    'marble',
    'granite',
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
            const presetDefinition = STONE_MINERAL_PRESET_DEFINITIONS[resolveStoneMineralEffectPreset(material)];
            return createRoughnessAuthorityMap({
                roughness: presetDefinition.roughnessByFinish[options.surfaceFinish],
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

    const presetDefinition = STONE_MINERAL_PRESET_DEFINITIONS[resolveStoneMineralEffectPreset(material)];
    const appearance = APPEARANCE[material];
    const width = canvas.width;
    const height = canvas.height;
    const capabilityContext = { canvas, context, width, height };

    applyMacroBreakup(capabilityContext, {
        brightColor: `rgb(${appearance.brightColor})`,
        darkColor: `rgb(${appearance.darkColor})`,
        alpha: presetDefinition.breakupAlpha,
        bandStep: presetDefinition.breakupBandStep,
        direction: presetDefinition.breakupDirection,
    });

    applyVeinMask(capabilityContext, {
        color: `rgb(${appearance.veinColor})`,
        alpha: presetDefinition.veinAlpha,
        veinCount: presetDefinition.veinCount,
        amplitude: presetDefinition.veinAmplitude,
    });

    applyInclusionParticles(capabilityContext, {
        color: `rgb(${appearance.inclusionColor})`,
        alpha: Math.min(0.03, presetDefinition.inclusionDensityScale * 0.03),
        densityScale: presetDefinition.inclusionDensityScale,
        minSize: 1,
        maxSize: presetDefinition.inclusionSizeMax,
    });

    applyEdgeBehavior(capabilityContext, {
        brightColor: `rgb(${appearance.brightColor})`,
        darkColor: `rgb(${appearance.darkColor})`,
        alpha: finish === 'polished' ? 0.06 : finish === 'hammered' ? 0.03 : 0.045,
    });

    texture.needsUpdate = true;
}
