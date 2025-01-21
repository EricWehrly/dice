import * as THREE from 'three';
import chroma from 'chroma-js';

// camera settings
const FOV = 90;
const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const NEAR_CLIP = 0.1;
const FAR_CLIP = 1000;

const ANIMATION_TIMES = [0, 0.5, 1]; // Animation start, mid, and end times
const DISTANCE_BEHIND_CAMERA = 8;
const PARABOLIC_PEAK_OFFSET = 5; // Offset for the peak of the parabolic arc

const SLIDE_AMOUNT = 0.5; // Amount of slide when the cube lands
const RATTLE_AMOUNT = 0.2; // Amount of rattle when the cube lands

export function init() {

  console.log('game start!');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, ASPECT_RATIO, NEAR_CLIP, FAR_CLIP);
  const renderer = new THREE.WebGLRenderer();

  renderer.setSize(window.innerWidth, window.innerHeight);
  const vscodeGray = chroma('dimgray').hex();
  renderer.setClearColor(vscodeGray);
  document.body.appendChild(renderer.domElement);

  camera.position.z = 5;

  function createCubeAtCursor(event: MouseEvent) {
    const geometry = new THREE.BoxGeometry();
    const vscodeBlue = chroma('dodgerblue').hex();
    const material = new THREE.MeshBasicMaterial({ color: vscodeBlue, wireframe: true });
    const cube = new THREE.Mesh(geometry, material);

    // Spawn the cube behind and above the camera
    cube.position.set(camera.position.x, camera.position.y + 5, camera.position.z + DISTANCE_BEHIND_CAMERA);
    scene.add(cube);

    const cubeDestinationPosition = calculatePosition(event, camera);

    // Calculate the parabolic trajectory
    const midY = (cube.position.y + cubeDestinationPosition.y) / 2 + PARABOLIC_PEAK_OFFSET; // Peak of the parabola
    const midZ = (cube.position.z + cubeDestinationPosition.z) / 2 + PARABOLIC_PEAK_OFFSET; // Peak of the parabola

    const parabolicTrack = new THREE.VectorKeyframeTrack('.position', ANIMATION_TIMES, [
      cube.position.x, cube.position.y, cube.position.z,
      cube.position.x, midY, cube.position.z + (cubeDestinationPosition.z - cube.position.z) / 2,
      cubeDestinationPosition.x, cubeDestinationPosition.y, cubeDestinationPosition.z
    ]);

    const slideTrack = new THREE.VectorKeyframeTrack('.position', [1, 1.5], [
      cubeDestinationPosition.x, cubeDestinationPosition.y, cubeDestinationPosition.z,
      cubeDestinationPosition.x + SLIDE_AMOUNT, cubeDestinationPosition.y, cubeDestinationPosition.z + SLIDE_AMOUNT
    ]);

    const rattleTrack = new THREE.VectorKeyframeTrack('.position', [1.5, 2], [
      cubeDestinationPosition.x + SLIDE_AMOUNT, cubeDestinationPosition.y, cubeDestinationPosition.z + SLIDE_AMOUNT,
      cubeDestinationPosition.x + SLIDE_AMOUNT + RATTLE_AMOUNT, cubeDestinationPosition.y, cubeDestinationPosition.z + SLIDE_AMOUNT - RATTLE_AMOUNT
    ]);

    const clip = new THREE.AnimationClip('move', 2, [parabolicTrack, slideTrack, rattleTrack]);
    const mixer = new THREE.AnimationMixer(cube);
    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce, 1); // Play the animation one time
    action.clampWhenFinished = true; // Keep the last frame when finished
    action.play();

    function animate() {
      requestAnimationFrame(animate);
      mixer.update(0.01);
      renderer.render(scene, camera);
    }

    animate();
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

  window.addEventListener('mouseup', (event) => {
    if (event.button === 0) {
      console.trace('mouse click registered');
      createCubeAtCursor(event);
    }
  });

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();
}
