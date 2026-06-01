import * as THREE from 'three';
import { createD6FaceAtlasTexture } from '../DieFaceTextureAtlas';
import { type MaterialTextureGenerator, type MaterialTextureGeneratorOptions } from '../MaterialTextureGenerator';
import { type DieSurfaceFinish } from '../DieTextureTypes';
import {
    applyDepthAttenuation,
    applyEdgeBehavior,
    applyGlazeLayer,
    applyInclusionParticles,
    applyMicroGrain,
    createRoughnessAuthorityMap,
} from '../capabilities';

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
            const roughness = ROUGHNESS_VALUES[material][options.surfaceFinish];
            return createRoughnessAuthorityMap({
                roughness,
                faceSize: options.faceSize ?? 256,
                grainAlpha: material === 'resin' ? 0.008 : 0.014,
                grainStep: material === 'resin' ? 9 : 7,
            });
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

    const capabilityContext = { canvas, context, width, height };

    applyMicroGrain(capabilityContext, {
        color: `rgb(${appearance.streakColor})`,
        alpha: tuning.streakAlpha,
        step: 6,
        direction: material === 'resin' ? 'horizontal' : 'diagonal',
    });

    applyGlazeLayer(capabilityContext, {
        alpha: material === 'resin' ? 0.06 : 0.03,
        poolingAlpha: material === 'resin' ? 0.025 : 0.01,
    });

    if (material === 'resin') {
        applyDepthAttenuation(capabilityContext, {
            centerColor: 'rgb(255, 255, 255)',
            edgeColor: 'rgb(172, 126, 98)',
            alpha: 0.08,
            radiusScale: 0.9,
        });
    }

    applyInclusionParticles(capabilityContext, {
        color: `rgb(${appearance.speckleColor})`,
        alpha: tuning.speckleAlpha,
        densityScale: tuning.speckleCountScale,
        minSize: 1,
        maxSize: 2,
    });

    applyEdgeBehavior(capabilityContext, {
        brightColor: `rgb(${appearance.edgeColor})`,
        alpha: tuning.edgeAlpha,
    });

    texture.needsUpdate = true;
}
