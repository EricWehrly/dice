import { describe, expect, it, vi } from 'vitest';
import mockEvents from '../../engine/test/testHelpers/mockEvents';
import mockMap from '../../engine/test/testHelpers/mockMap';

vi.mock('@/engine/js/events', () => mockEvents);
vi.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);

import { createEntityFrom } from '../../engine/js/entities/character/EntityBuilder';
import { Die } from '../../src/game/Die';
import { EquippableBase } from '../../engine/js/baseTypes/Equippable';
import { DieEquippedMixin } from '../../src/game/DieEquippedMixin';
import type { DieEquipped } from '../../src/game/DieEquippedMixin';
import { DieSlotType } from '../../src/game/DieEquippedMixin';

class TestDieEquippable extends EquippableBase<DieSlotType> {
    readonly id: string;

    constructor(id: string, name: string, type: DieSlotType) {
        super({ name, type });
        this.id = id;
    }
}

type EquippedDie = Die & DieEquipped;

describe('DieEquipped mixin integration (game layer)', () => {
    it('applies to Die via createEntityFrom(Die) and supports initial slot population', () => {
        const modA = new TestDieEquippable('mod-5g', 'weight-5g', DieSlotType.MOD);
        const face = new TestDieEquippable('face-etched', 'etched', DieSlotType.FACE_STYLE);

        const die = createEntityFrom(Die)
            .withMixin(DieEquippedMixin)
            .withOptions({ faceCount: 6, id: 'd1', equipped: [modA, face] })
            .build() as EquippedDie;

        expect(die.faceCount).toBe(6);
        expect(die.getEquipped(DieSlotType.MOD)).toBe(modA);
        expect(die.getEquipped(DieSlotType.FACE_STYLE)).toBe(face);
    });

    it('supports install replacement and uninstall', () => {
        const modA = new TestDieEquippable('mod-5g', 'weight-5g', DieSlotType.MOD);
        const modB = new TestDieEquippable('mod-10g', 'weight-10g', DieSlotType.MOD);

        const die = createEntityFrom(Die)
            .withMixin(DieEquippedMixin)
            .withOptions({ faceCount: 6, id: 'd2', equipped: [modA] })
            .build() as EquippedDie;

        expect(die.getEquipped(DieSlotType.MOD)).toBe(modA);

        die.install(modB);
        expect(die.getEquipped(DieSlotType.MOD)).toBe(modB);
        expect(die.hasEquipped(DieSlotType.MOD)).toBe(true);

        die.uninstall(DieSlotType.MOD);
        expect(die.getEquipped(DieSlotType.MOD)).toBeNull();
        expect(die.hasEquipped(DieSlotType.MOD)).toBe(false);
    });
});
