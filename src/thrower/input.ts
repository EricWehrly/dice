import * as THREE from 'three';
import { Colors } from '../utils/colors';
import { createParabolicTrack } from './animate-parabolic';
import { createRattleTracks } from './animate-rattle';
import { RenderingContextManager } from '../rendering/RenderingContextManager';
import { Dice, DiceOptions } from '../game/Dice';
import { AnimationSequencer } from '../utils/AnimationSequencer';

const DISTANCE_BEHIND_CAMERA = 8;

export function createCubeAtCursor(event: MouseEvent, camera: THREE.PerspectiveCamera, renderContext: RenderingContextManager) {
  const diceOptions: DiceOptions = {
    foreColor: Colors.dodgerblue,
    backColor: Colors.antiquewhite
  };
  const gameObject = new Dice(diceOptions);

  const cube = renderContext.addToScene(gameObject);
  // Spawn the cube behind and above the camera
  cube.position.set(camera.position.x, camera.position.y + 5, camera.position.z + DISTANCE_BEHIND_CAMERA);

  // Apply a random rotation to the dice
  applyRandomRotation(cube, gameObject.faceCount);

  const cubeDestinationPosition = calculatePosition(event, camera);

  return animateCube(cube, cubeDestinationPosition);
}

function applyRandomRotation(dice: THREE.Object3D, faceCount: number) {
  const randomFace = Math.floor(Math.random() * faceCount);
  const angle = (2 * Math.PI) / faceCount;
  dice.rotation.x = randomFace * angle;
  dice.rotation.y = randomFace * angle;
  dice.rotation.z = randomFace * angle;
}

function calculatePosition(event: MouseEvent, camera: THREE.PerspectiveCamera): THREE.Vector3 {
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

function animateCube(cube: THREE.Mesh, cubeDestinationPosition: THREE.Vector3) {
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
