import * as THREE from 'three';
import { Colors } from '../utils/colors';
import { createCubeAtCursor } from './input';
import { RenderingContextManager } from '../rendering/RenderingContextManager';
import { getIntersects } from '../utils/intersects';
import { RotationViewer } from '../rendering/RotationViewer';
import { DiceRenderer } from '../rendering/Dice.renderer';

// camera settings
const FOV = 90;
const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const NEAR_CLIP = 0.1;
const FAR_CLIP = 1000;
const VIEWER_WIDTH = 300;
const VIEWER_HEIGHT = 300;

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

      const hitObject = intersects[0].object;
      const gameObject = renderContext.getGameObject(hitObject);
      const renderer = hitObject as unknown as DiceRenderer;
      if(!gameObject || !renderer) {
        console.error('Could not find game object or renderer for hit object');
        return;
      }
      // const cube = new DiceRenderer();
      // console.log('Game object:', gameObject);

      const viewer = new RotationViewer({
        name: `rotation-viewer-${Date.now()}`,
        width: VIEWER_WIDTH,
        height: VIEWER_HEIGHT
      });
      viewer.addToScene(gameObject);
      
      // Position the viewer at the cursor
      viewer.setPosition(event.clientX, event.clientY);
      
      viewer.start();
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
