import * as THREE from 'three';

export function ensureDiceLighting(scene: THREE.Scene): void {
    if (scene.getObjectByName('dice-ambient-light')) {
        ensureDiceEnvironment(scene);
        return;
    }

    const ambient = new THREE.AmbientLight(0xfff8ee, 0.25);
    ambient.name = 'dice-ambient-light';
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xfff3da, 0x6a5f52, 0.55);
    hemi.name = 'dice-hemi-light';
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffefcf, 0.9);
    key.name = 'dice-key-light';
    key.position.set(4, 16, 6);
    key.castShadow = true;
    key.shadow.mapSize.width = 2048;
    key.shadow.mapSize.height = 2048;
    key.shadow.bias = -0.0002;
    key.shadow.normalBias = 0.015;
    key.shadow.radius = 5;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 56;
    key.shadow.camera.left = -22;
    key.shadow.camera.right = 22;
    key.shadow.camera.top = 20;
    key.shadow.camera.bottom = -20;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xffe7be, 0.35);
    fill.name = 'dice-fill-light';
    fill.position.set(-8, 10, 7);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xfff6ea, 0.25);
    rim.name = 'dice-rim-light';
    rim.position.set(-2, 11, -9);
    scene.add(rim);

    ensureDiceEnvironment(scene);
}

function ensureDiceEnvironment(scene: THREE.Scene): void {
    if (scene.environment) {
        return;
    }

    const width = 512;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
        const fallbackData = new Uint8Array([
            247, 239, 225, 255,
            168, 191, 216, 255,
            63, 79, 100, 255,
            255, 244, 220, 255,
        ]);
        const fallbackTexture = new THREE.DataTexture(fallbackData, 2, 2, THREE.RGBAFormat);
        fallbackTexture.colorSpace = THREE.SRGBColorSpace;
        fallbackTexture.mapping = THREE.EquirectangularReflectionMapping;
        fallbackTexture.generateMipmaps = true;
        fallbackTexture.minFilter = THREE.LinearMipmapLinearFilter;
        fallbackTexture.magFilter = THREE.LinearFilter;
        fallbackTexture.needsUpdate = true;
        scene.environment = fallbackTexture;
        return;
    }

    const skyGradient = context.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, '#f7efe1');
    skyGradient.addColorStop(0.42, '#a8bfd8');
    skyGradient.addColorStop(1, '#3f4f64');
    context.fillStyle = skyGradient;
    context.fillRect(0, 0, width, height);

    context.fillStyle = 'rgba(255, 244, 220, 0.38)';
    context.beginPath();
    context.arc(width * 0.23, height * 0.28, height * 0.18, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = 'rgba(255, 248, 234, 0.28)';
    context.beginPath();
    context.arc(width * 0.74, height * 0.34, height * 0.14, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = 'rgba(255, 255, 255, 0.12)';
    context.fillRect(width * 0.05, height * 0.84, width * 0.9, height * 0.08);

    const environmentTexture = new THREE.CanvasTexture(canvas);
    environmentTexture.colorSpace = THREE.SRGBColorSpace;
    environmentTexture.mapping = THREE.EquirectangularReflectionMapping;
    environmentTexture.generateMipmaps = true;
    environmentTexture.minFilter = THREE.LinearMipmapLinearFilter;
    environmentTexture.magFilter = THREE.LinearFilter;
    environmentTexture.needsUpdate = true;
    scene.environment = environmentTexture;
}
