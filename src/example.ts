import * as THREE from 'three';

const FOV = 75;
const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const NEAR_CLIP = 0.1;
const FAR_CLIP = 1000;
const COLOR_NEON_GREEN = 0x00ff00;
const CUBE_ROTATION_INCREMENT = 0.01;

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

  function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += CUBE_ROTATION_INCREMENT;
    cube.rotation.y += CUBE_ROTATION_INCREMENT;
    renderer.render(scene, camera);
  }

  animate();
}
