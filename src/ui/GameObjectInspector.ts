import * as THREE from 'three';
import { getIntersects } from '../utils/intersects';
import { RotationViewer } from '../rendering/RotationViewer';
import { DiceRenderer } from '../rendering/Dice.renderer';
import { RenderingContextManager } from '../rendering/RenderingContextManager';

const VIEWER_WIDTH = 300;
const VIEWER_HEIGHT = 300;

export function handleContextMenu(event: MouseEvent, camera: THREE.Camera, renderContext: RenderingContextManager) {
  event.preventDefault();
  const intersects = getIntersects(event, camera, renderContext.scene);
  if (intersects.length > 0) {
    const hitObject = intersects[0].object;
    const gameObject = renderContext.getGameObject(hitObject);
    const renderer = hitObject as unknown as DiceRenderer;
    if (!gameObject || !renderer) {
      console.error('Could not find game object or renderer for hit object');
      return;
    }

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
}

export function attachContextMenuListener(camera: THREE.Camera, renderContext: RenderingContextManager) {
  window.addEventListener('contextmenu', (event) => {
    handleContextMenu(event, camera, renderContext);
  });
}
