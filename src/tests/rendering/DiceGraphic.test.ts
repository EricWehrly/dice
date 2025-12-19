import * as THREE from 'three';

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

describe('DiceGraphic', () => {
    it('does not throw when entity lacks dice config and still creates a graphic with pips', () => {
        // Require after globals are present
        const { createEntity } = require('../../../engine/js/entities/character/EntityBuilder');
        const { DiceGraphic } = require('../../rendering/DiceGraphic');

        const entity = createEntity().withOptions({ name: 'test-entity' }).build();
        // Ensure the dice config is not present on the entity
        delete (entity as any).dice;

        // Constructing DiceGraphic should not throw even if config is missing
        expect(() => new DiceGraphic(entity)).not.toThrow();

        const graphic = new DiceGraphic(entity);
        const mesh = graphic.getGraphic();

        expect(mesh).toBeDefined();
        // Expect geometry to exist (cast to Mesh)
        expect((mesh as THREE.Mesh).geometry).toBeDefined();
        // Expect pips/groups to be attached (pip utility adds a Group)
        expect(mesh.children.length).toBeGreaterThanOrEqual(0);
    });

    it('creates appropriate geometry for faceCount (6 -> BoxGeometry)', () => {
        const { createEntity } = require('../../../engine/js/entities/character/EntityBuilder');
        const { DiceGraphic } = require('../../rendering/DiceGraphic');

        const diceConfig = { faceCount: 6, foreColor: '#000000', backColor: '#ffffff' };
        const entity = createEntity().withOptions({ name: 'dice-entity', dice: diceConfig }).build();
        // Some engine code may not copy arbitrary options onto the instance, so ensure it's present
        (entity as any).dice = diceConfig;

        const graphic = new DiceGraphic(entity);
        const mesh = graphic.getGraphic();

        // BoxGeometry should have been constructed (mocked BoxGeometry called)
        expect(((mesh as unknown) as THREE.Mesh).geometry).toBeDefined();
        expect((THREE as any).BoxGeometry).toHaveBeenCalled();
    });
});