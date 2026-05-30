import * as THREE from 'three';

import { ensureDiceLighting } from '../../rendering/lighting';

describe('ensureDiceLighting', () => {
    it('installs a shadow-capable multi-light rig once', () => {
        const scene = new THREE.Scene();

        ensureDiceLighting(scene);
        ensureDiceLighting(scene);

        const ambient = scene.getObjectByName('dice-ambient-light');
        const hemi = scene.getObjectByName('dice-hemi-light');
        const key = scene.getObjectByName('dice-key-light') as THREE.DirectionalLight | undefined;
        const fill = scene.getObjectByName('dice-fill-light');
        const rim = scene.getObjectByName('dice-rim-light');
        const environment = scene.environment;

        expect(ambient).toBeInstanceOf(THREE.AmbientLight);
        expect(hemi).toBeInstanceOf(THREE.HemisphereLight);
        expect(key).toBeInstanceOf(THREE.DirectionalLight);
        expect(fill).toBeInstanceOf(THREE.DirectionalLight);
        expect(rim).toBeInstanceOf(THREE.DirectionalLight);
        expect(key?.castShadow).toBe(true);
        expect(environment).toBeInstanceOf(THREE.Texture);
        expect(scene.children.filter((child) => child.name === 'dice-key-light')).toHaveLength(1);
    });
});