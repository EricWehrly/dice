import { type DieBodyMaterial } from './DieTextureTypes';
import { type MaterialTextureGenerator } from './MaterialTextureGenerator';

/**
 * Global registry for material texture generators.
 * 
 * Materials register their texture generation strategy (color-based, procedural,
 * baked, or hybrid) so the rendering pipeline can request appropriate textures
 * without hardcoding generation logic.
 * 
 * Flow:
 * 1. Material authors call MaterialTextureRegistry.register() with a generator
 * 2. During die creation, the renderer calls MaterialTextureRegistry.get() to
 *    retrieve the generator for the die's body material
 * 3. If found, the generator produces the texture; if not, fallback to color-only
 * 4. Enables independent material authoring (F14) without changing core renderer
 */
export class MaterialTextureRegistry {
    private static readonly generators: Map<DieBodyMaterial, MaterialTextureGenerator> = new Map();

    /**
     * Register a material texture generator.
     * 
     * @param generator Generator for a specific material
     */
    static register(generator: MaterialTextureGenerator): void {
        MaterialTextureRegistry.generators.set(generator.material, generator);
    }

    /**
     * Retrieve a registered generator for a material.
     * 
     * @param material Material type to look up
     * @returns Generator if registered, undefined otherwise
     */
    static get(material: DieBodyMaterial): MaterialTextureGenerator | undefined {
        return MaterialTextureRegistry.generators.get(material);
    }

    /**
     * Check if a generator is registered for a material.
     * 
     * @param material Material type to check
     * @returns true if a generator exists
     */
    static has(material: DieBodyMaterial): boolean {
        return MaterialTextureRegistry.generators.has(material);
    }

    /**
     * Clear all registered generators (primarily for testing).
     */
    static clear(): void {
        MaterialTextureRegistry.generators.clear();
    }

    /**
     * Get count of registered generators (primarily for testing/debugging).
     */
    static size(): number {
        return MaterialTextureRegistry.generators.size;
    }
}
