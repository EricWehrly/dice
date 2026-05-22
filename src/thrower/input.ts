import * as THREE from 'three';
import { Colors } from '../utils/colors';
import { createParabolicTrack } from './animate-parabolic';
import { createRattleTracks } from './animate-rattle';
import { AnimationSequencer } from '../utils/AnimationSequencer';
import { DiceGraphic } from '../rendering/DiceGraphic';
import { createEntity } from '../../engine/js/entities/character/EntityBuilder';
import Entity from '../../engine/js/entities/character/Entity';
import { GetEntity3DGraphic } from '../../engine/js/rendering/entities/entity-3d-graphics';

const DISTANCE_BEHIND_CAMERA = 8;

export async function createCubeAtCursor(event: MouseEvent, camera: THREE.PerspectiveCamera): Promise<{cube: THREE.Mesh, mixer: THREE.AnimationMixer | null, entity: Entity}> {
  const faceCount = 6;

  // Calculate spawn position behind camera
  const spawnPosition = {
    x: camera.position.x,
    y: camera.position.y + 5,
    z: camera.position.z + DISTANCE_BEHIND_CAMERA
  };

  // Create a dice entity
  const diceEntity = createEntity()
    .withOptions({
      name: 'Thrown Dice',
      position: spawnPosition,
      faceCount: 6,
      foreColor: Colors.dodgerblue,
      backColor: Colors.antiquewhite
    })
    .build();

  // Configure 3D graphics
  (diceEntity as any).entity3DConfig = {
    graphicClass: DiceGraphic,
    visible: true,
    offset: { x: 0, y: 0, z: 0 }
  };

  // Wait for the engine to materialize the Three.js graphic for the entity
  const meshObj = await waitForEntityGraphic(diceEntity);

  // Prefer a Mesh if the graphic is a Group
  const cube = (meshObj instanceof THREE.Mesh) ? meshObj : (meshObj.children?.find(c => c instanceof THREE.Mesh) as THREE.Mesh) || (meshObj as THREE.Mesh);

  // Set spawn position on the mesh
  cube.position.set(spawnPosition.x, spawnPosition.y, spawnPosition.z);

  // Apply a random rotation to the dice
  applyRandomRotation(cube, faceCount);

  // Compute destination position; if running in a non-browser environment (tests), fall back to spawn position
  let cubeDestinationPosition: THREE.Vector3;
  // If running in tests or a non-standard environment, allow opting out of the calculation
  if (typeof window !== 'undefined' && !(window as any).__TEST_DISABLE_CALC) {
    cubeDestinationPosition = calculatePosition(event, camera);
  } else {
    cubeDestinationPosition = (cube.position as unknown) as THREE.Vector3;
  }

  // Optionally skip animations in test environment
  let mixer: THREE.AnimationMixer | null = null;
  if (typeof window === 'undefined' || !(window as any).__TEST_DISABLE_ANIMATION) {
    mixer = animateCube(cube, cubeDestinationPosition);
  }
  return {
    cube,
    mixer,
    entity: diceEntity
  };
}

function applyRandomRotation(dice: THREE.Object3D, faceCount: number) {
  const randomFace = Math.floor(Math.random() * faceCount);
  const angle = (2 * Math.PI) / faceCount;
  dice.rotation.x = randomFace * angle;
  dice.rotation.y = randomFace * angle;
  dice.rotation.z = randomFace * angle;
}

function waitForEntityGraphic(entity: Entity): Promise<THREE.Object3D> {
  return new Promise((resolve) => {
    const tryGet = () => {
      const g = GetEntity3DGraphic(entity);
      if (g) {
        resolve(g);
      } else {
        requestAnimationFrame(tryGet);
      }
    };
    tryGet();
  });
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

export function animateCube(cube: THREE.Mesh, cubeDestinationPosition: THREE.Vector3) {
  const sequencer = new AnimationSequencer(cube);

  const parabolicTrack = createParabolicTrack(cube.position, cubeDestinationPosition);
  sequencer.addTrack(parabolicTrack, {
    startTime: 0,
    duration: 1.0
  });

  const { rattlePositionTrack, rattleRotationTrack } = createRattleTracks(cubeDestinationPosition);
  sequencer.addTrack(rattlePositionTrack, {
    startTime: 0.8, // Start rattle before parabolic ends
    duration: 1.2,
    blendDuration: 0.2
  });
  
  sequencer.addTrack(rattleRotationTrack, {
    startTime: 0.8,
    duration: 1.2,
    blendDuration: 0.2
  });

  return sequencer.play();
}
