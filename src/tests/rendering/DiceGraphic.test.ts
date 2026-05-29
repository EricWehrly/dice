import * as THREE from 'three';
import { vi } from 'vitest';

// Some engine modules reference `window` during module initialization. Ensure minimal globals
if (typeof (global as any).window === 'undefined') {
    (global as any).window = {};
}
if (typeof (global as any).document === 'undefined') {
    (global as any).document = { createElement: () => ({}) } as any;
}
// Provide a minimal crypto.getRandomValues implementation used by generateId()
if (!(global as any).window.crypto) {
    (global as any).window.crypto = {
        getRandomValues: (arr: Uint8Array) => {
            for (let i = 0; i < arr.length; i++) arr[i] = i & 0xff;
            return arr;
        }
    } as Crypto;
}

const mockCanvasContext = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    shadowColor: 'transparent',
    shadowBlur: 0,
    shadowOffsetY: 0,
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 0,
};

if (typeof HTMLCanvasElement !== 'undefined') {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((contextId: string) => {
        if (contextId === '2d') {
            return mockCanvasContext as unknown as CanvasRenderingContext2D;
        }
        return null;
    });
}

describe('DiceGraphic', () => {
    it('does not throw when entity lacks dice config and still creates a graphic', async () => {
        // Import after globals are present
        const { createEntity } = (await import('../../../engine/js/entities/character/EntityBuilder')) as any;
        const { DiceGraphic } = (await import('../../rendering/DiceGraphic')) as any;

        const entity = createEntity().withOptions({ name: 'test-entity' }).build();
        // Ensure the dice config is not present on the entity
        delete (entity as any).dice;

        // Constructing DiceGraphic should not throw even if config is missing
        expect(() => new DiceGraphic(entity)).not.toThrow();

        const graphic = new DiceGraphic(entity);
        const mesh = graphic.getGraphic();

        expect(mesh).toBeDefined();
        expect((mesh as THREE.Mesh).geometry).toBeDefined();
        expect((mesh as THREE.Mesh).material).toBeDefined();
    });

    it('creates textured physical materials for a d6', async () => {
        const { createEntity } = (await import('../../../engine/js/entities/character/EntityBuilder')) as any;
        const { DiceGraphic } = (await import('../../rendering/DiceGraphic')) as any;

        const diceConfig = { faceCount: 6, foreColor: '#000000', backColor: '#ffffff' };
        const entity = createEntity().withOptions({ name: 'dice-entity', dice: diceConfig }).build();
        Object.assign(entity as object, diceConfig);

        const graphic = new DiceGraphic(entity);
        const mesh = graphic.getGraphic();

        expect(((mesh as unknown) as THREE.Mesh).geometry).toBeDefined();
        expect((mesh as THREE.Mesh).material).toBeInstanceOf(THREE.MeshPhysicalMaterial);
        expect(mesh.children).toHaveLength(0);
    });

    it('falls back to legacy pip geometry for non-d6 dice', async () => {
        const { createEntity } = (await import('../../../engine/js/entities/character/EntityBuilder')) as any;
        const { DiceGraphic } = (await import('../../rendering/DiceGraphic')) as any;

        const diceConfig = { faceCount: 8, foreColor: '#000000', backColor: '#ffffff' };
        const entity = createEntity().withOptions({ name: 'd8-entity', dice: diceConfig }).build();
        Object.assign(entity as object, diceConfig);

        const graphic = new DiceGraphic(entity);
        const mesh = graphic.getGraphic();

        expect((mesh as THREE.Mesh).material).toBeInstanceOf(THREE.MeshStandardMaterial);
        expect(mesh.children.length).toBeGreaterThan(0);
    });

    it('multiplies entity position by scene scale during update', async () => {
        const { createEntity } = (await import('../../../engine/js/entities/character/EntityBuilder')) as any;
        const { DiceGraphic } = (await import('../../rendering/DiceGraphic')) as any;
        const Coordinate3D = (await import('../../../engine/js/coordinates/Coordinate3D')).default as any;

        const entity = createEntity().withOptions({
            name: 'scaled-position-entity',
            position: { x: 2, y: -1, z: 0.5 },
            dice: { faceCount: 6, foreColor: '#000000', backColor: '#ffffff' },
        }).build();

        (entity as any).position.update(new Coordinate3D(2, -1, 0.5));

        const graphic = new DiceGraphic(entity);
        graphic.update(16);

        const mesh = graphic.getGraphic();
        expect(mesh.position.x).toBeCloseTo(4);
        expect(mesh.position.y).toBeCloseTo(-2);
        expect(mesh.position.z).toBeCloseTo(1);
    });

    it('orients d6 mesh so faceUp appears on top', async () => {
        const { DiceGraphic } = (await import('../../rendering/DiceGraphic')) as any;
        const { Die } = (await import('../../game/Die')) as any;

        const entity = new Die({ faceCount: 6 });
        entity.faceUp = 2;

        const graphic = new DiceGraphic(entity);
        graphic.update(16);

        const mesh = graphic.getGraphic();
        // Empirical display correction maps faceUp=2 through the d6 remap table.
        expect(mesh.rotation.x).toBeCloseTo(0);
        expect(mesh.rotation.z).toBeCloseTo(-Math.PI / 2);
    });
});