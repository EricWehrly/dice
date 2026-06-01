import * as THREE from 'three';
import { EntityGraphicThree } from '../../engine/js/rendering/entities/EntityGraphicThree';
import Entity from '../../engine/js/entities/character/Entity';
import { registerEntity3DRenderer } from '../../engine/js/rendering/entities/entity-3d-graphics';
import { getDiceConfig, DiceConfig } from '../game/Dice';
import { PipUtils } from './util/PipUtils';
import { registerEntityMesh } from './EntityMeshRegistry';
import { Die } from '../game/Die';
import { createPhysicalD6Material } from './materials/PhysicalD6Material';
import { createStandardDieMaterial } from './materials/StandardDieMaterial';
import { resolveDieMaterialPreset } from './textures/DieMaterialPreset';
import { MaterialTextureRegistry } from './textures/MaterialTextureRegistry';
import { MetalMaterialGenerators } from './textures/generators/MetalMaterialGenerator';
import { SyntheticPolymerMaterialGenerators } from './textures/generators/SyntheticPolymerMaterialGenerator';
import { CeramicMaterialGenerators } from './textures/generators/CeramicMaterialGenerator';
import { StoneMineralMaterialGenerators } from './textures/generators/StoneMineralMaterialGenerator';
import { normalizeRenderPipStyle } from '../game/PipStyle';

/**
 * 3D graphics handler for Dice entities
 * Manages the Three.js representation of dice in the game world
 */
// TODO: Split into physics-based material with texture vs legacy geometry+material path
export class DiceGraphic extends EntityGraphicThree {
    private static readonly ALLOWED_FACE_COUNTS = [4, 6, 8, 12, 20];
    private static readonly SCENE_POSITION_SCALE = 2;
    private static readonly D6_TEXTURE_FACE_SIZE = 256;
    
    private diceConfig: DiceConfig;
    private materialSignature = '';

    static {
        registerEntity3DRenderer(Die, DiceGraphic);
        // Initialize material texture generators
        SyntheticPolymerMaterialGenerators.forEach((generator) => MaterialTextureRegistry.register(generator));
        CeramicMaterialGenerators.forEach((generator) => MaterialTextureRegistry.register(generator));
        StoneMineralMaterialGenerators.forEach((generator) => MaterialTextureRegistry.register(generator));
        MetalMaterialGenerators.forEach((generator) => MaterialTextureRegistry.register(generator));
    }
    
    constructor(entity: Entity) {
        super(entity);
        this.diceConfig = getDiceConfig(entity) || {
            faceCount: 6,
            foreColor: '#000000',
            backColor: '#ffffff'
        };
    }

    createGraphic(): THREE.Object3D {
        // Use the entity at runtime to obtain configuration (createGraphic may be called
        // during super() before the derived constructor body runs). This keeps createGraphic
        // resilient when subclass initialization hasn't completed yet.
        const config = this.diceConfig ?? getDiceConfig(this.entity);
        const faceCount = config?.faceCount ?? 6;
        const materialColors = this.resolveMaterialColors(config);

        if (!DiceGraphic.ALLOWED_FACE_COUNTS.includes(faceCount)) {
            throw new Error(`Invalid faceCount: ${faceCount}. Allowed values are ${DiceGraphic.ALLOWED_FACE_COUNTS.join(', ')}`);
        }

        // Create geometry based on face count
        const geometry = this.createGeometry(faceCount);
        const meshMaterial = this.createMaterial(config, faceCount, geometry, materialColors);

        const mesh = new THREE.Mesh(geometry, meshMaterial);
        this.materialSignature = this.getMaterialSignature(config);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        registerEntityMesh(mesh, this.entity);

        if (!(meshMaterial instanceof THREE.MeshPhysicalMaterial)) {
            this.addPips(mesh, faceCount, materialColors.pipColor);
        }

        this.applyFaceUpOrientation(faceCount, mesh);
        
        return mesh;
    }

    private resolveMaterialColors(config: DiceConfig): { bodyPreset: ReturnType<typeof resolveDieMaterialPreset>; pipColor: string } {
        const bodyPreset = resolveDieMaterialPreset({
            bodyMaterial: config.bodyMaterial,
            surfaceFinish: config.surfaceFinish,
        });

        // Determine pip color: if pipMaterial differs from bodyMaterial, use its pip accent color
        let pipColor = bodyPreset.pipColor;
        if (config.pipMaterial && config.pipMaterial !== config.bodyMaterial) {
            const pipPreset = resolveDieMaterialPreset({
                bodyMaterial: config.pipMaterial,
                surfaceFinish: config.surfaceFinish,
            });
            pipColor = pipPreset.pipColor;
        }

        return { bodyPreset, pipColor };
    }

    private createMaterial(
        config: DiceConfig,
        faceCount: number,
        geometry: THREE.BufferGeometry,
        materialColors: { bodyPreset: ReturnType<typeof resolveDieMaterialPreset>; pipColor: string },
    ): THREE.Material {
        const { bodyPreset, pipColor } = materialColors;

        if (faceCount === 6) {
            try {
                return createPhysicalD6Material({
                    backgroundColor: bodyPreset.backgroundColor,
                    pipColor: pipColor,
                    geometry: geometry as THREE.BoxGeometry,
                    textureFaceSize: DiceGraphic.D6_TEXTURE_FACE_SIZE,
                    bodyMaterial: config.bodyMaterial,
                    surfaceFinish: config.surfaceFinish,
                    pipStyle: normalizeRenderPipStyle(config.pipStyle),
                    pipSize: config.pipSize,
                });
            } catch (error) {
                console.warn('Falling back to legacy d6 material path', error);
            }
        }

        return createStandardDieMaterial({
            backColor: bodyPreset.backgroundColor,
            roughness: bodyPreset.surface.roughness,
            metalness: bodyPreset.surface.metalness,
        });
    }

    private createGeometry(faceCount: number): THREE.BufferGeometry {
        const size = 1.0; // Keep the die readable without blowing up the face texture
        switch (faceCount) {
            case 4:
                return new THREE.TetrahedronGeometry(size);
            case 6:
                return new THREE.BoxGeometry(size, size, size);
            case 8:
                return new THREE.OctahedronGeometry(size);
            case 12:
                return new THREE.DodecahedronGeometry(size);
            case 20:
                return new THREE.IcosahedronGeometry(size);
            default:
                throw new Error(`Unsupported faceCount: ${faceCount}`);
        }
    }

    private async addPips(parent: THREE.Object3D, faceCount: number, foreColor: string): Promise<void> {
        await PipUtils.addPips(parent, faceCount, foreColor);
    }

    update(deltaTime: number): void {
        this.refreshMaterialIfNeeded(this.graphic as THREE.Mesh);
        this.graphic.position.x = (this.entity.position.x || 0) * DiceGraphic.SCENE_POSITION_SCALE;
        this.graphic.position.y = (this.entity.position.y || 0) * DiceGraphic.SCENE_POSITION_SCALE;
        this.graphic.position.z = (this.entity.position.z || 0) * DiceGraphic.SCENE_POSITION_SCALE;
        this.applyFaceUpOrientation(this.diceConfig.faceCount ?? 6, this.graphic as THREE.Mesh);
    }

    private refreshMaterialIfNeeded(mesh: THREE.Mesh): void {
        const nextConfig = getDiceConfig(this.entity);
        const nextSignature = this.getMaterialSignature(nextConfig);
        if (nextSignature === this.materialSignature) {
            this.diceConfig = nextConfig;
            return;
        }

        const nextMaterialColors = this.resolveMaterialColors(nextConfig);
        const nextMaterial = this.createMaterial(
            nextConfig,
            nextConfig.faceCount,
            mesh.geometry as THREE.BufferGeometry,
            nextMaterialColors,
        );

        this.disposeMaterial(mesh.material);
        mesh.material = nextMaterial;
        this.clearPipChildren(mesh);

        if (!(nextMaterial instanceof THREE.MeshPhysicalMaterial)) {
            this.addPips(mesh, nextConfig.faceCount, nextMaterialColors.pipColor);
        }

        this.diceConfig = nextConfig;
        this.materialSignature = nextSignature;
    }

    private getMaterialSignature(config: DiceConfig): string {
        return [
            config.faceCount,
            config.foreColor,
            config.backColor,
            config.bodyMaterial ?? '',
            config.pipMaterial ?? '',
            config.surfaceFinish ?? '',
            config.pipStyle ?? '',
            config.pipSize ?? '',
        ].join('|');
    }

    private clearPipChildren(mesh: THREE.Mesh): void {
        while (mesh.children.length > 0) {
            const child = mesh.children.pop();
            if (!child) {
                continue;
            }

            mesh.remove(child);

            const childMesh = child as THREE.Mesh;
            if (childMesh.geometry) {
                childMesh.geometry.dispose();
            }

            this.disposeMaterial(childMesh.material);
        }
    }

    private disposeMaterial(material: THREE.Material | THREE.Material[]): void {
        const materials = Array.isArray(material) ? material : [material];
        materials.forEach((item) => item.dispose());
    }

    private applyFaceUpOrientation(faceCount: number, mesh: THREE.Mesh): void {
        if (faceCount !== 6 || !mesh) {
            return;
        }

        const faceUp = (this.entity as unknown as { faceUp?: number }).faceUp;
        if (!Number.isInteger(faceUp)) {
            return;
        }
        const resolvedFaceUp = faceUp as number;

        // Empirical runtime correction: rendered top face currently maps as
        // 1->5, 2->4, 3->2, 4->6, 5->1, 6->3. Invert that mapping so the
        // visual face shown on top matches the logical faceUp value.
        const visualFixMap: Record<number, number> = {
            1: 5,
            2: 3,
            3: 6,
            4: 2,
            5: 1,
            6: 4,
        };
        const correctedFaceUp = visualFixMap[resolvedFaceUp] ?? resolvedFaceUp;

        // Rotation mapping derived from D6_FACE_ORDER in DieFaceTextureAtlas.ts:
        // Geometry face → value: +X=3, -X=4, +Y=1, -Y=6, +Z=2, -Z=5
        // To show face N on top (+Y), rotate that face to face +Y.
        switch (correctedFaceUp) {
            case 1: // +Y is already top
                mesh.rotation.set(0, 0, 0);
                break;
            case 2: // +Z → rotate -90° around X so +Z faces up
                mesh.rotation.set(-Math.PI / 2, 0, 0);
                break;
            case 3: // +X → rotate +90° around Z so +X faces up
                mesh.rotation.set(0, 0, -Math.PI / 2);
                break;
            case 4: // -X → rotate -90° around Z so -X faces up
                mesh.rotation.set(0, 0, Math.PI / 2);
                break;
            case 5: // -Z → rotate +90° around X so -Z faces up
                mesh.rotation.set(Math.PI / 2, 0, 0);
                break;
            case 6: // -Y → rotate 180° around X so -Y faces up
                mesh.rotation.set(Math.PI, 0, 0);
                break;
            default:
                break;
        }
    }
}
