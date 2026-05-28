import * as THREE from 'three';
import { EntityGraphicThree } from '../../engine/js/rendering/entities/EntityGraphicThree';
import Entity from '../../engine/js/entities/character/Entity';
import { registerEntity3DRenderer } from '../../engine/js/rendering/entities/entity-3d-graphics';
import { getDiceConfig, DiceConfig } from '../game/Dice';
import { PipUtils } from './util/PipUtils';
import { registerEntityMesh } from './EntityMeshRegistry';
import { Die } from '../game/Die';

/**
 * 3D graphics handler for Dice entities
 * Manages the Three.js representation of dice in the game world
 */
export class DiceGraphic extends EntityGraphicThree {
    private static readonly ALLOWED_FACE_COUNTS = [4, 6, 8, 12, 20];
    
    private diceConfig: DiceConfig;
    private mesh!: THREE.Mesh;

    static {
        registerEntity3DRenderer(Die, DiceGraphic);
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
        console.log('DiceGraphic.createGraphic() called for entity:', this.entity);
        // Use the entity at runtime to obtain configuration (createGraphic may be called
        // during super() before the derived constructor body runs). This keeps createGraphic
        // resilient when subclass initialization hasn't completed yet.
        const cfg = this.diceConfig ?? getDiceConfig(this.entity);
        const faceCount = cfg?.faceCount ?? 6;
        console.log('DiceGraphic config:', cfg, 'faceCount:', faceCount);

        if (!DiceGraphic.ALLOWED_FACE_COUNTS.includes(faceCount)) {
            throw new Error(`Invalid faceCount: ${faceCount}. Allowed values are ${DiceGraphic.ALLOWED_FACE_COUNTS.join(', ')}`);
        }

        // Create geometry based on face count
        const geometry = this.createGeometry(faceCount);
        const material = new THREE.MeshStandardMaterial({
            color: cfg.backColor,
            roughness: 0.7,
            metalness: 0.1
        });

        this.mesh = new THREE.Mesh(geometry, material);
        console.log('Created dice mesh:', this.mesh);

        registerEntityMesh(this.mesh, this.entity);

        // Add pips asynchronously (PipUtils is synchronous in current implementation)
        this.addPips(this.mesh, faceCount, cfg.foreColor);
        
        return this.mesh;
    }

    private createGeometry(faceCount: number): THREE.BufferGeometry {
        const size = 1.5; // Make dice bigger and visible
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
        this.graphic.position.x = this.entity.position.x || 0;
        this.graphic.position.y = this.entity.position.y || 0;
        this.graphic.position.z = this.entity.position.z || 0;
    }
}
