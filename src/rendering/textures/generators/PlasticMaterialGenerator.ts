import * as THREE from 'three';
import { type MaterialTextureGenerator, type MaterialTextureGeneratorOptions } from '../MaterialTextureGenerator';
import { createD6FaceAtlasTexture } from '../DieFaceTextureAtlas';

/**
 * Plastic material texture generator.
 * 
 * Produces solid-color d6 atlas textures with configurable body and pip colors.
 * Serves as the baseline rendering approach and fallback for other materials
 * if their specific generators are not available.
 * 
 * This is a simple color-based approach; texture authoring (F14) will upgrade
 * this with procedural or baked textures for each material.
 */
export const PlasticMaterialGenerator: MaterialTextureGenerator = {
    material: 'plastic',
    label: 'Plastic',

    generateTexture(options: MaterialTextureGeneratorOptions): THREE.CanvasTexture {
        // For now, plastic uses the simple color-based approach
        // Future materials in Tier 1+ will provide procedural/baked textures
        return createD6FaceAtlasTexture({
            backgroundColor: options.backgroundColor,
            pipColor: options.pipColor,
            faceSize: options.faceSize,
            edgeRoundness: options.edgeRoundness,
            pipStyle: options.pipStyle,
        });
    },
};
