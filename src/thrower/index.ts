import * as THREE from 'three';
import { createCubeAtCursor } from './input';
import { initThrowPathFollower } from './ThrowPathFollower';
import { attachContextMenuListener } from '../ui/GameObjectInspector';
import { InputManager } from '../controls/InputManager';
import ThreeJSRenderContext from '../../engine/js/rendering/contexts/ThreeJS.RenderContext';

export function init() {
  console.log('game start!');

  const renderContext = ThreeJSRenderContext.Instance;
  const canvas = renderContext.canvas;
  const camera = renderContext.camera as THREE.PerspectiveCamera;
  initThrowPathFollower();

  // Handle throws only when the mouseup target is the 3D viewport canvas.
  canvas.addEventListener('mouseup', (event) => {
    if (event.target !== canvas) {
      return;
    }

    console.trace('mouse click registered');
    const inputMgr = InputManager.Instance;
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
  });

  attachContextMenuListener(camera, renderContext.scene as unknown as THREE.Scene, canvas);

  // Throw path follower updates entity positions through the engine render loop.
}
