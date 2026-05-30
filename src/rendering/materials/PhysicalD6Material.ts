import * as THREE from 'three';
import { createD6FaceAtlasMaterialTexture, createD6FaceSurfaceDetailTexture } from '../textures/DieFaceTextureAtlas';
import { MaterialTextureRegistry } from '../textures/MaterialTextureRegistry';
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
    const surfaceFinish = (config.surfaceFinish as DieSurfaceFinish) ?? 'plain';

    const texture = createD6FaceAtlasMaterialTexture({
        geometry: config.geometry,
        backgroundColor: preset.backgroundColor,
        pipColor,
        faceSize: config.textureFaceSize,
        edgeRoundness: config.edgeRoundness,
        bodyMaterial: config.bodyMaterial as DieBodyMaterial | undefined,
        surfaceFinish,
        pipStyle: config.pipStyle,
        pipSize: config.pipSize,
    });

    // Bump map is always generated (it's geometric detail for pips, not material-specific)
    const bumpMap = createD6FaceSurfaceDetailTexture({
        kind: 'bump',
        geometry: config.geometry,
        backgroundColor: preset.backgroundColor,
        pipColor,
        faceSize: config.textureFaceSize,
        edgeRoundness: config.edgeRoundness,
        surfaceFinish,
        pipStyle: config.pipStyle,
        pipSize: config.pipSize,
    });

    // Roughness map is material-specific: request from generator if available
    let roughnessMap: THREE.CanvasTexture | undefined;
    const bodyMaterial = config.bodyMaterial as DieBodyMaterial | undefined;
    if (bodyMaterial) {
        const generator = MaterialTextureRegistry.get(bodyMaterial);
        if (generator?.generateRoughnessMap) {
            roughnessMap = generator.generateRoughnessMap({
                backgroundColor: preset.backgroundColor,
                pipColor,
                surfaceFinish,
                faceSize: config.textureFaceSize ?? 256,
                edgeRoundness: config.edgeRoundness,
                pipStyle: config.pipStyle,
                pipSize: config.pipSize,
            });
        } else if (generator) {
            console.warn(
                `[D6 Material] Generator for "${generator.label}" does not implement generateRoughnessMap. ` +
                'Roughness map will not be applied.',
            );
        }
    }

    const generator = bodyMaterial ? MaterialTextureRegistry.get(bodyMaterial) : undefined;
    const isMetal = generator?.category === 'metal';

    // Increase bump scale for metals to enhance pip depth, but avoid over-darkening polished faces.
    const bumpScale = !isMetal
        ? 0.04
        : surfaceFinish === 'polished'
            ? 0.055
            : surfaceFinish === 'hammered'
                ? 0.1
                : surfaceFinish === 'etched'
                    ? 0.085
                    : 0.075;

    let envMapIntensity = !isMetal
        ? 0.6
        : surfaceFinish === 'polished'
            ? 1.0
            : surfaceFinish === 'hammered'
                ? 0.75
                : surfaceFinish === 'etched'
                    ? 0.65
                    : 0.8;
    envMapIntensity = 0;

    return new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        map: texture,
        bumpMap,
        bumpScale,
        roughnessMap,
        roughness: roughnessMap ? 1 : preset.surface.roughness,
        metalness: preset.surface.metalness,
        envMapIntensity,
        clearcoat: preset.surface.clearcoat,
        clearcoatRoughness: preset.surface.clearcoatRoughness,
    });
}
