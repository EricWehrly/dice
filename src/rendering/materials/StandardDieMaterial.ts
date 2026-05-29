import * as THREE from 'three';

export interface StandardDieMaterialConfig {
    backColor: string;
    roughness?: number;
    metalness?: number;
}

/**
 * Creates a MeshStandardMaterial for non-d6 dice rendering.
 * Used as fallback when physical materials are unavailable or for non-d6 dice.
 * Conservative properties ensure compatibility across rendering contexts.
 *
 * @param config Configuration for material color
 * @returns MeshStandardMaterial instance
 */
export function createStandardDieMaterial(config: StandardDieMaterialConfig): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
        color: config.backColor,
        roughness: config.roughness ?? 0.7,
        metalness: config.metalness ?? 0.1,
    });
}
