import * as THREE from 'three';
import { Colors } from '../utils/colors';
import { createParabolicTrack } from './animate-parabolic';
import { createRattleTracks } from './animate-rattle';
import { RenderingContextManager } from '../rendering/RenderingContextManager';
import { Dice, DiceOptions } from '../game/Dice';
import { AnimationSequencer } from '../utils/AnimationSequencer';

const DISTANCE_BEHIND_CAMERA = 8;

export function createCubeAtCursor(event: MouseEvent, camera: THREE.PerspectiveCamera, renderContext: RenderingContextManager) {
  // const geometry = new THREE.BoxGeometry();
  // const vscodeBlue = Colors.dodgerblue;
  // const material = new THREE.MeshBasicMaterial({ color: vscodeBlue, wireframe: true });
  // const cube = new THREE.Mesh(geometry, material);

  const diceOptions: DiceOptions = {
    foreColor: Colors.black,
    backColor: Colors.antiquewhite
  };
  const gameObject = new Dice(diceOptions);
  // const cube = new DiceCube(gameObject);

  // Spawn the cube behind and above the camera
  const cube = renderContext.addToScene(gameObject);
  cube.position.set(camera.position.x, camera.position.y + 5, camera.position.z + DISTANCE_BEHIND_CAMERA);

  const cubeDestinationPosition = calculatePosition(event, camera);

  return animateCube(cube, cubeDestinationPosition);
}

function calculatePosition(event: MouseEvent, camera: THREE.PerspectiveCamera): THREE.Vector3 {
  // Create a vector from the mouse event coordinates
  const vector = new THREE.Vector3(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1,
    0.5
  );

  // Unproject the vector to get the direction
  vector.unproject(camera);
  const dir = vector.sub(camera.position).normalize();

  // Calculate the distance from the camera to the point in the direction
  const distance = -camera.position.z / dir.z;

  // Calculate the final position by adding the direction vector scaled by the distance to the camera position
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
