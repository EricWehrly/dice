import * as THREE from 'three';
import { getIntersects } from '../utils/intersects';
import { getEntityForMesh } from '../rendering/EntityMeshRegistry';

export function handleContextMenu(event: MouseEvent, camera: THREE.Camera, scene: THREE.Scene) {
  event.preventDefault();

  const intersects = getIntersects(event, camera, scene);

  if (intersects.length > 0) {
    const hit = intersects[0].object;
    const mappedEntity = getEntityForMesh(hit);
    console.info('Inspector raycast hit:', {
      objectUuid: hit.uuid,
      objectType: hit.type,
      mappedEntityId: mappedEntity?.id
    });
  } else {
    console.info('Inspector raycast miss');
  }

  if (intersects.length === 0) return;

  const entity = getEntityForMesh(intersects[0].object);
  if (!entity) return;

  // Inspector UI is deferred pending engine-level modal/scene capabilities.
  // For now, keep entity selection plumbing in place for future implementation.
  (window as any).__lastInspectedEntity = entity;
  console.info('Inspector deferred: entity selected for future inspector flow.', {
    name: (entity as any).name,
    id: (entity as any).id
  });
}

export function attachContextMenuListener(camera: THREE.Camera, scene: THREE.Scene) {
  window.addEventListener('contextmenu', (event) => {
    handleContextMenu(event, camera, scene);
  });
}

