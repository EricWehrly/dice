import * as THREE from 'three';

function deduplicateIntersections(intersections: THREE.Intersection[]): THREE.Intersection[] {
  const uniqueIntersections = new Map<string, THREE.Intersection>();
  intersections.forEach(intersection => {
    uniqueIntersections.set(intersection.object.uuid, intersection);
  });
  return Array.from(uniqueIntersections.values());
}

export function getIntersects(event: MouseEvent, camera: THREE.Camera, scene: THREE.Scene): THREE.Intersection[] {
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersections = raycaster.intersectObjects(scene.children);
  return deduplicateIntersections(intersections);
}
