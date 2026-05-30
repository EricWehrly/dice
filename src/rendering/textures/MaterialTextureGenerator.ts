import * as THREE from 'three';
import { type DieBodyMaterial, type DieSurfaceFinish } from './DieTextureTypes';
import { type RenderPipStyle } from '../../game/PipStyle';

/**
 * Options passed to a material texture generator.
 * 
 * Provides all information needed to generate or retrieve a texture for a specific
 * material + finish combination.
 */
export interface MaterialTextureGeneratorOptions {
    readonly backgroundColor: string;
    readonly pipColor: string;
    readonly surfaceFinish: DieSurfaceFinish;
    readonly faceSize: number;
    readonly edgeRoundness?: number;
    readonly pipStyle?: RenderPipStyle;
    readonly pipSize?: number;
}

/**
 * Material texture generator interface.
 * 
 * Each material type registers a generator that knows how to produce realistic
 * textures (procedural, baked, or hybrid) for that material under different
 * finish conditions.
 * 
 * Generators are called during material creation and can:
 * - Generate procedural textures using Canvas 2D
 * - Load and apply baked textures from URLs
 * - Apply finish-specific overlays or adjustments
 * - Cache results to avoid regenerating identical textures
 */
export interface MaterialTextureGenerator {
    readonly material: DieBodyMaterial;
    readonly label: string;
    /**
     * Generate a texture for this material with the given options.
     * 
     * @param options Configuration for texture generation
     * @returns Canvas texture ready to apply to die material
     */
    generateTexture(options: MaterialTextureGeneratorOptions): THREE.CanvasTexture;
}
