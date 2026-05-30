import * as THREE from 'three';

export function ensureDiceLighting(scene: THREE.Scene): void {
    if (scene.getObjectByName('dice-ambient-light')) {
        return;
    }

    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    ambient.name = 'dice-ambient-light';
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xf3f7ff, 0x4f5661, 0.85);
    hemi.name = 'dice-hemi-light';
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff4dc, 1.7);
    key.name = 'dice-key-light';
    key.position.set(8, 12, 10);
    key.castShadow = true;
    key.shadow.mapSize.width = 2048;
    key.shadow.mapSize.height = 2048;
    key.shadow.bias = -0.0002;
    key.shadow.normalBias = 0.02;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 40;
    key.shadow.camera.left = -12;
    key.shadow.camera.right = 12;
    key.shadow.camera.top = 12;
    key.shadow.camera.bottom = -12;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xd7e6ff, 0.85);
    fill.name = 'dice-fill-light';
    fill.position.set(-10, 7, 6);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.55);
    rim.name = 'dice-rim-light';
    rim.position.set(-4, 9, -11);
    scene.add(rim);
}
