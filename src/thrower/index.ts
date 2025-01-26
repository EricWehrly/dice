import * as THREE from 'three';
import { Colors } from '../utils/colors';
import { createCubeAtCursor } from './input';
import { RenderingContextManager } from '../rendering/RenderingContext';
import { getIntersects } from '../utils/intersects';

// camera settings
const FOV = 90;
const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const NEAR_CLIP = 0.1;
const FAR_CLIP = 1000;

class ThrowRenderer extends RenderingContextManager { }

export function init() {
  console.log('game start!');

  const renderContext = new ThrowRenderer({
    name: 'main'
  });

  const camera = new THREE.PerspectiveCamera(FOV, ASPECT_RATIO, NEAR_CLIP, FAR_CLIP);
  const renderer = new THREE.WebGLRenderer();

  renderer.setSize(window.innerWidth, window.innerHeight);
  const vscodeGray = Colors.dimgray;
  renderer.setClearColor(vscodeGray);
  document.body.appendChild(renderer.domElement);

  camera.position.z = 5;

  const mixers: THREE.AnimationMixer[] = [];

  window.addEventListener('mouseup', (event) => {
    if (event.button === 0) {
      console.trace('mouse click registered');
      const mixer = createCubeAtCursor(event, camera, renderContext);
      if (mixer) mixers.push(mixer);
    }
  });

  window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const intersects = getIntersects(event, camera, renderContext.scene);
    if (intersects.length > 0) {
      console.log('Hit:', intersects[0].object);

      // retrieve the gameobject

      // open a new RotationViewer to inspect the object.
      // the viewer should appear where the curosr is
      // and be 300x300 pixels
    } else {
      console.log('No hits');
    }
  });

  let previousTime = performance.now();

  function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - previousTime) / 1000; // convert to seconds
    previousTime = currentTime;

    mixers.forEach(mixer => mixer.update(deltaTime));

    renderer.render(renderContext.scene, camera);
  }

  animate();
}
