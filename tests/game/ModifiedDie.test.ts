import { describe, expect, it, vi } from 'vitest';
import { createEntityFrom } from '../../engine/js/entities/character/EntityBuilder';
import Events from '../../engine/js/events';
import { Die } from '../../src/game/Die';
import { DieEquippedMixin } from '../../src/game/DieEquippedMixin';
import type { DieEquipped } from '../../src/game/DieEquippedMixin';
import { DieSlotType } from '../../src/game/DieEquipmentTypes';
import { DieWeightMod } from '../../src/game/mods/DieWeightMod';

type EquippedDie = Die & DieEquipped;

function createEquippedDie(): EquippedDie {
    return createEntityFrom(Die)
        .withMixin(DieEquippedMixin)
        .withOptions({ faceCount: 6 })
        .build() as EquippedDie;
}

describe('ModifiedDie (equipment integration)', () => {
    it('installs and replaces weight mods in the MOD slot', () => {
        const die = createEquippedDie();

        die.install(new DieWeightMod({ id: 'weight-1.5', faceIndex: 1, grams: 1.5 }));
        expect(die.getEquipped(DieSlotType.MOD)?.id).toBe('weight-1.5');

        die.install(new DieWeightMod({ id: 'weight-2.0', faceIndex: 4, grams: 2.0 }));
        expect(die.getEquipped(DieSlotType.MOD)?.id).toBe('weight-2.0');
    });

    it('uninstall clears an installed MOD slot item', () => {
        const die = createEquippedDie();

        die.install(new DieWeightMod({ id: 'weight-2.5', faceIndex: 2, grams: 2.5 }));
        expect(die.getEquipped(DieSlotType.MOD)?.id).toBe('weight-2.5');

        die.uninstall(DieSlotType.MOD);
        expect(die.getEquipped(DieSlotType.MOD)).toBeNull();
    });

    it('emits DieEquipmentChanged on install and uninstall', () => {
        const die = createEquippedDie();
        const callback = vi.fn();
        const subscriptionId = Events.Subscribe(Events.List.DieEquipmentChanged, callback);

        die.install(new DieWeightMod({ id: 'weight-1.0', faceIndex: 0, grams: 1.0 }));
        die.uninstall(DieSlotType.MOD);

        expect(callback).toHaveBeenCalledTimes(2);
        if (subscriptionId) {
            Events.Unsubscribe(subscriptionId);
        }
    });
});
