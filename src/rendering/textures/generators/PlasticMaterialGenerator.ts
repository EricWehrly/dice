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
            pipSize: options.pipSize,
        });
    },

    generateRoughnessMap(options: MaterialTextureGeneratorOptions): THREE.CanvasTexture {
        const faceSize = options.faceSize ?? 256;
        const canvas = document.createElement('canvas');
        const gap = Math.max(4, Math.round(faceSize * 0.05));
        canvas.width = (3 * faceSize) + (4 * gap);
        canvas.height = (2 * faceSize) + (3 * gap);

        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Failed to create 2D canvas context for plastic roughness texture');
        }

        // Plastic has moderate roughness (mid-gray) to reflect its matte surface
        context.fillStyle = '#9c9c9c';
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
