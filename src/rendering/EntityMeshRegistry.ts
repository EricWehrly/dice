import * as THREE from 'three';
import Entity from '../../engine/js/entities/character/Entity';

type EntityId = Entity['id'];

type EntityUserData = {
    entityId?: EntityId;
};

/**
 * Registry mapping Three.js mesh UUIDs to Engine entities.
 * Populated when DiceGraphic (or any EntityGraphicThree subclass) creates its mesh.
 * Queried by GameObjectInspector raycasting to resolve hit objects back to entities.
 */
function setEntityIdOnUserData(object3d: THREE.Object3D, entityId: EntityId): void {
    (object3d as any).userData = (object3d as any).userData ?? {};
    ((object3d as any).userData as EntityUserData).entityId = entityId;
}

function clearEntityIdOnUserData(object3d: THREE.Object3D): void {
    const userData = (object3d as any).userData as EntityUserData | undefined;
    if (userData?.entityId !== undefined) {
        delete userData.entityId;
    }
}

function getEntityIdFromUserData(object3d: THREE.Object3D): EntityId | undefined {
    const userData = (object3d as any).userData as EntityUserData | undefined;
    return userData?.entityId;
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

export function getEntityForMesh(object3d: THREE.Object3D): Entity | undefined {
    const entityId = getEntityIdFromUserData(object3d);
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
