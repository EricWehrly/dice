import * as THREE from 'three';
import { Colors } from '../utils/colors';
import { createParabolicTrack } from './animate-parabolic';
import { createRattleTracks } from './animate-rattle';

const DISTANCE_BEHIND_CAMERA = 8;

export function createCubeAtCursor(event: MouseEvent, camera: THREE.PerspectiveCamera, scene: THREE.Scene) {
  const geometry = new THREE.BoxGeometry();
  const vscodeBlue = Colors.dodgerblue;
  const material = new THREE.MeshBasicMaterial({ color: vscodeBlue, wireframe: true });
  const cube = new THREE.Mesh(geometry, material);

  // Spawn the cube behind and above the camera
  cube.position.set(camera.position.x, camera.position.y + 5, camera.position.z + DISTANCE_BEHIND_CAMERA);
  scene.add(cube);

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
  const parabolicTrack = createParabolicTrack(cube.position, cubeDestinationPosition);
  const { rattlePositionTrack, rattleRotationTrack } = createRattleTracks(cubeDestinationPosition);

  const clip = new THREE.AnimationClip('diceToss', 2, [
    parabolicTrack,
    rattlePositionTrack,
    rattleRotationTrack
  ]);

  console.log('playing animation, returning mixer');
  const mixer = new THREE.AnimationMixer(cube);
  const action = mixer.clipAction(clip);
  action.play();
  action.setLoop(THREE.LoopOnce, 1); // Play the animation one time
  action.clampWhenFinished = true; // Keep the last frame when finished
  return mixer;
}
