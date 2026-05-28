import * as THREE from 'three';

export function ensureDiceLighting(scene: THREE.Scene): void {
    if (scene.getObjectByName('dice-ambient-light')) {
        return;
    }

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    ambient.name = 'dice-ambient-light';
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.name = 'dice-key-light';
    key.position.set(8, 12, 10);
    scene.add(key);
}
