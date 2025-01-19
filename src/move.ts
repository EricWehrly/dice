import * as THREE from 'three';

const FOV = 75;
const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const NEAR_CLIP = 0.1;
const FAR_CLIP = 1000;
const COLOR_NEON_GREEN = 0x00ff00;
const MOVE_DELTA = 1;

export function init() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, ASPECT_RATIO, NEAR_CLIP, FAR_CLIP);
  const renderer = new THREE.WebGLRenderer();

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: COLOR_NEON_GREEN });
  const cube = new THREE.Mesh(geometry, material);

  scene.add(cube);
  camera.position.z = 5;

  const desiredDelta = { x: 0, y: 0, z: 0 };
  let lastTime = performance.now();

  function animate() {
    requestAnimationFrame(animate);
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000; // convert to seconds

    cube.position.x += desiredDelta.x * deltaTime;
    cube.position.y += desiredDelta.y * deltaTime;
    cube.position.z += desiredDelta.z * deltaTime;

    lastTime = currentTime;
    renderer.render(scene, camera);
  }

  function onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'A':
      case 'a':
        desiredDelta.x = -MOVE_DELTA;
        break;
      case 'D':
      case 'd':
        desiredDelta.x = MOVE_DELTA;
        break;
      case 'W':
      case 'w':
        desiredDelta.z = -MOVE_DELTA;
        break;
      case 'S':
      case 's':
        desiredDelta.z = MOVE_DELTA;
        break;
      case 'Q':
      case 'q':
        desiredDelta.y = MOVE_DELTA;
        break;
      case 'E':
      case 'e':
        desiredDelta.y = -MOVE_DELTA;
        break;
    }
  }

  function onKeyUp(event: KeyboardEvent) {
    switch (event.key) {
      case 'A':
      case 'a':
      case 'D':
      case 'd':
        desiredDelta.x = 0;
        break;
      case 'W':
      case 'w':
      case 'S':
      case 's':
        desiredDelta.z = 0;
        break;
      case 'Q':
      case 'q':
      case 'E':
      case 'e':
        desiredDelta.y = 0;
        break;
    }
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  animate();
}
