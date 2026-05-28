import * as THREE from 'three';

// Provide a lightweight global window mock for engine modules that reference window
if (typeof (global as any).window === 'undefined') {
  (global as any).window = {};
}

// Provide a minimal crypto.getRandomValues implementation used by engine utilities
if (!(global as any).window.crypto) {
  (global as any).window.crypto = {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
      return arr;
    }
  };
}

vi.mock('../../engine/js/rendering/entities/entity-3d-graphics', () => ({
  GetEntity3DGraphic: vi.fn(),
  registerEntity3DRenderer: vi.fn(),
}));

import { GetEntity3DGraphic } from '../../engine/js/rendering/entities/entity-3d-graphics';

describe('createCubeAtCursor', () => {
  beforeEach(() => {
    (GetEntity3DGraphic as unknown as any).mockReset();
  });

  test('creates entity and returns mesh and mixer when graphic exists', async () => {
    // Ensure window dimensions are present for calculatePosition
    (global as any).window.innerWidth = 1024;
    (global as any).window.innerHeight = 768;

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1));
    (GetEntity3DGraphic as unknown as any).mockImplementation(() => mesh);

    // Ensure THREE.Vector3 exists and has the minimal methods used by calculatePosition
    if (typeof (THREE as any).Vector3 !== 'function') {
      (THREE as any).Vector3 = function (this: any, x = 0, y = 0, z = 0) {
        this.x = x; this.y = y; this.z = z;
        this.unproject = function (this: any) { return this; };
        this.sub = function (this: any) { return this; };
        this.normalize = function (this: any) { return this; };
        this.multiplyScalar = function (this: any) { return this; };
        this.clone = function (this: any) { return this; };
        this.add = function (this: any) { return this; };
      } as any;
    }

    // Import createCubeAtCursor lazily to avoid eager engine initialization before window is mocked
    const inputModule = await import('../../src/thrower/input');
    const { createCubeAtCursor } = inputModule;

    const camera = new THREE.PerspectiveCamera(90, 1, 0.1, 1000);
    camera.position.set(0, 0, -10);

    const fakeEvent = {
      clientX: 100,
      clientY: 100,
      button: 0
    } as unknown as MouseEvent;

    // Opt out of the calculatePosition and animation paths for tests
    (global as any).window.__TEST_DISABLE_CALC = true;
    (global as any).window.__TEST_DISABLE_ANIMATION = true;
    const result = await createCubeAtCursor(fakeEvent, camera);
    // Restore window for subsequent tests
    delete (global as any).window.__TEST_DISABLE_CALC;
    delete (global as any).window.__TEST_DISABLE_ANIMATION;

    expect(result).toBeDefined();
    expect((result as any).name).toBe('Thrown Dice');
  });
});