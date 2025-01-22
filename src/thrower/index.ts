import * as THREE from 'three';
import chroma from 'chroma-js';
import { createCubeAtCursor } from './animation';

// camera settings
const FOV = 90;
const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const NEAR_CLIP = 0.1;
const FAR_CLIP = 1000;

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

  window.addEventListener('mouseup', (event) => {
    if (event.button === 0) {
      console.trace('mouse click registered');
      createCubeAtCursor(event, camera, scene, renderer);
    }
  });

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();
}
