import * as THREE from 'three';
import { Colors } from '../utils/colors';
import { createEntity } from '../../engine/js/entities/character/EntityBuilder';
import Entity from '../../engine/js/entities/character/Entity';
import { enqueueThrowPath } from './ThrowPathFollower';

const DISTANCE_BEHIND_CAMERA = 8;

export function createCubeAtCursor(event: MouseEvent, camera: THREE.PerspectiveCamera): Entity {
  const spawnPosition = {
    x: camera.position.x,
    y: camera.position.y + 5,
    z: camera.position.z + DISTANCE_BEHIND_CAMERA
  };

  const landPosition = calculatePosition(event, camera);

  const diceEntity = createEntity()
    .withOptions({
      name: 'Thrown Dice',
      position: spawnPosition,
      faceCount: 6,
      foreColor: Colors.dodgerblue,
      backColor: Colors.antiquewhite
    })
    .build();

  enqueueThrowPath(
    diceEntity,
    new THREE.Vector3(spawnPosition.x, spawnPosition.y, spawnPosition.z),
    landPosition
  );

  return diceEntity;
}

export function calculatePosition(event: MouseEvent, camera: THREE.PerspectiveCamera): THREE.Vector3 {
  const vector = new THREE.Vector3(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1,
    0.5
  );

  vector.unproject(camera);
  const dir = vector.sub(camera.position).normalize();
  const distance = -camera.position.z / dir.z;
  return camera.position.clone().add(dir.multiplyScalar(distance));
}

