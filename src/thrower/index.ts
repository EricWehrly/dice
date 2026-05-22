import * as THREE from 'three';
import { Colors } from '../utils/colors';
import { createCubeAtCursor } from './input';
import { RenderingContextManager } from '../rendering/RenderingContextManager';
import { attachContextMenuListener } from '../ui/GameObjectInspector';
import ThreeJSRenderContext from '@/engine/js/rendering/contexts/ThreeJS.RenderContext';

// camera settings
const FOV = 90;
const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const NEAR_CLIP = 0.1;
const FAR_CLIP = 1000;

export function init() {
  console.log('game start!');

  const renderContext = ThreeJSRenderContext.Instance;
  const camera = renderContext.camera as THREE.PerspectiveCamera;

  const mixers: THREE.AnimationMixer[] = [];

  // Handle left-click throws with cooldown
  window.addEventListener('mouseup', (event) => {
    if (event.button === 0) {
      console.trace('mouse click registered');
      // Lazy-check cooldown
      // Import here to avoid circular dependency at top-level in tests
      const { InputManager } = require('../controls/InputManager');
      const inputMgr = InputManager.Instance as any;
      if (!inputMgr.canThrow()) {
        console.trace('throw blocked by cooldown or inspecting');
        return;
      }
      inputMgr.recordThrow();

      // createCubeAtCursor now returns a promise that resolves when the mesh exists
      createCubeAtCursor(event, camera).then(({ cube, mixer }) => {
        if (mixer) mixers.push(mixer);
      }).catch(err => {
        console.error('Failed to create thrown cube:', err);
      });
    }
  });

  attachContextMenuListener(camera, renderContext as unknown as any);

  // Register render method with engine's ThreeJSRenderContext system
  let previousTime = performance.now();
  ThreeJSRenderContext.RegisterRenderMethod(100, (context: any) => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - previousTime) / 1000;
    previousTime = currentTime;

    mixers.forEach(mixer => mixer.update(deltaTime));
  });
}
