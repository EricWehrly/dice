import * as THREE from 'three';
import Entity from '../../engine/js/entities/character/Entity';

/**
 * Registry mapping Three.js mesh UUIDs to Engine entities.
 * Populated when DiceGraphic (or any EntityGraphicThree subclass) creates its mesh.
 * Queried by GameObjectInspector raycasting to resolve hit objects back to entities.
 */
function setEntityIdOnUserData(object3d: THREE.Object3D, entityId: string): void {
    (object3d as any).userData = (object3d as any).userData ?? {};
    (object3d as any).userData.entityId = entityId;
}

function clearEntityIdOnUserData(object3d: THREE.Object3D): void {
    if ((object3d as any).userData?.entityId !== undefined) {
        delete (object3d as any).userData.entityId;
    }
}

export function registerEntityMesh(object3d: THREE.Object3D, entity: Entity): void {
    setEntityIdOnUserData(object3d, entity.id);
    // Also register all child meshes so raycasting against groups/pip children works
    object3d.traverse(child => {
        if (child !== object3d) {
            setEntityIdOnUserData(child, entity.id);
        }
    });
}

export function getEntityIdForMesh(object3d: THREE.Object3D): string | undefined {
    return (object3d as any).userData?.entityId as string | undefined;
}

export function getEntityForMesh(object3d: THREE.Object3D): Entity | undefined {
    const entityId = getEntityIdForMesh(object3d);
    if (!entityId) return undefined;
    return Entity.List.find(entity => entity.id === entityId);
}

export function unregisterEntityMesh(object3d: THREE.Object3D): void {
    clearEntityIdOnUserData(object3d);
    object3d.traverse(child => {
        if (child !== object3d) {
            clearEntityIdOnUserData(child);
        }
    });
}
