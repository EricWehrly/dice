import * as THREE from 'three';
import { createD6FaceAtlasMaterialTexture } from '../textures/DieFaceTextureAtlas';
import { resolveDieMaterialPreset } from '../textures/DieMaterialPreset';
import { type DieBodyMaterial, type DieSurfaceFinish } from '../textures/DieTextureTypes';
import { type RenderPipStyle } from '../../game/PipStyle';

export interface PhysicalD6MaterialConfig {
    backgroundColor: string;
    pipColor: string;
    geometry: THREE.BoxGeometry;
    textureFaceSize?: number;
    bodyMaterial?: string;
    surfaceFinish?: string;
    edgeRoundness?: number;
    pipStyle?: RenderPipStyle;
    pipSize?: number;
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
    const preset = resolveDieMaterialPreset({
        bodyMaterial: config.bodyMaterial,
        surfaceFinish: config.surfaceFinish,
    });
    const pipColor = config.pipColor || preset.pipColor;

    const texture = createD6FaceAtlasMaterialTexture({
        geometry: config.geometry,
        backgroundColor: preset.backgroundColor,
        pipColor,
        faceSize: config.textureFaceSize,
        edgeRoundness: config.edgeRoundness,
        bodyMaterial: config.bodyMaterial as DieBodyMaterial | undefined,
        surfaceFinish: config.surfaceFinish as DieSurfaceFinish | undefined,
        pipStyle: config.pipStyle,
        pipSize: config.pipSize,
    });

    return new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        map: texture,
        roughness: preset.surface.roughness,
        metalness: preset.surface.metalness,
        clearcoat: preset.surface.clearcoat,
        clearcoatRoughness: preset.surface.clearcoatRoughness,
    });
}
