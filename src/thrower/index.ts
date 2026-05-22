import * as THREE from 'three';
import { createCubeAtCursor } from './input';
import { initThrowPathFollower } from './ThrowPathFollower';
import { attachContextMenuListener } from '../ui/GameObjectInspector';
import ThreeJSRenderContext from '../../engine/js/rendering/contexts/ThreeJS.RenderContext';

export function init() {
  console.log('game start!');

  const renderContext = ThreeJSRenderContext.Instance;
  const camera = renderContext.camera as THREE.PerspectiveCamera;
  initThrowPathFollower();

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

      try {
        createCubeAtCursor(event, camera);
      } catch (err) {
        console.error('Failed to create thrown cube:', err);
      }
    }
  });

  attachContextMenuListener(camera, renderContext.scene as unknown as THREE.Scene);

  // Throw path follower updates entity positions through the engine render loop.
}
