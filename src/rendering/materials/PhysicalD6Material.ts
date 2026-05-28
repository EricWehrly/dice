import * as THREE from 'three';
import { createD6FaceAtlasMaterialTexture } from '../textures/DieFaceTextureAtlas';

export interface PhysicalD6MaterialConfig {
    backgroundColor: string;
    pipColor: string;
    geometry: THREE.BoxGeometry;
    textureFaceSize?: number;
}

/**
 * Creates a single MeshPhysicalMaterial with a d6 face atlas texture.
 * Uses advanced physical material properties including clearcoat for realistic rendering.
 *
 * @param config Configuration for texture and material properties
 * @returns MeshPhysicalMaterial instance for d6 dice
 * @throws Error if texture generation fails
 */
export function createPhysicalD6Material(config: PhysicalD6MaterialConfig): THREE.MeshPhysicalMaterial {
    const texture = createD6FaceAtlasMaterialTexture({
        geometry: config.geometry,
        backgroundColor: config.backgroundColor,
        pipColor: config.pipColor,
        faceSize: config.textureFaceSize,
    });

    return new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        map: texture,
        roughness: 0.34,
        metalness: 0.02,
        clearcoat: 0.82,
        clearcoatRoughness: 0.24,
    });
}
