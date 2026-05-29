import { describe, expect, it, vi } from 'vitest';
import Events from '../../engine/js/events';
import { FACE_STAT_KEYS } from '../../src/game/DieStatKeys';
import { Die } from '../../src/game/Die';
import { DieWeightMod } from '../../src/game/mods/DieWeightMod';
import { DieSlotType } from '../../src/game/DieEquipmentTypes';

describe('Die', () => {
    it('tracks installed mod and applies its stat side-effects', () => {
        const die = new Die({
            faceCount: 6,
            mod: { faceIndex: 3, grams: 0.5, id: 'weight-0.5g' },
        });

        expect(die.mod).toMatchObject({ faceIndex: 3, grams: 0.5, id: 'weight-0.5g' });
        expect(die.getFaceStat(0, FACE_STAT_KEYS.WEIGHT)).toBeCloseTo(0, 6);
        expect(die.getFaceStat(3, FACE_STAT_KEYS.WEIGHT)).toBeCloseTo(0.5, 6);
    });

    it('addWeightMod installs a mod record and updates weight stat', () => {
        const die = new Die({ faceCount: 6 });

        die.addWeightMod(2, 1.25);

        expect(die.mod).toMatchObject({ faceIndex: 2, grams: 1.25 });
        expect(die.getFaceStat(2, FACE_STAT_KEYS.WEIGHT)).toBeCloseTo(1.25, 6);
    });

    it('ignores invalid mod installs', () => {
        const die = new Die({ faceCount: 6 });

        die.addWeightMod(-1, 1.0);
        die.addWeightMod(999, 1.0);
        die.addWeightMod(1, 0);
        die.addWeightMod(1, -1);

        expect(die.mod).toBeNull();
        expect(die.getFaceStat(1, FACE_STAT_KEYS.WEIGHT)).toBe(0);
    });

    it('install replaces previous weight target instead of stacking', () => {
        const die = new Die({ faceCount: 6 });

        die.install(new DieWeightMod({ id: 'weight-1.5', faceIndex: 1, grams: 1.5 }));
        expect(die.mod).toMatchObject({ faceIndex: 1, grams: 1.5, id: 'weight-1.5' });

        die.install(new DieWeightMod({ id: 'weight-2.0', faceIndex: 4, grams: 2.0 }));
        expect(die.mod).toMatchObject({ faceIndex: 4, grams: 2.0, id: 'weight-2.0' });
        expect(die.getFaceStat(1, FACE_STAT_KEYS.WEIGHT)).toBeCloseTo(0, 6);
        expect(die.getFaceStat(4, FACE_STAT_KEYS.WEIGHT)).toBeCloseTo(2.0, 6);
        expect(die.mod?.faceIndex).toBe(4);
        expect(die.mod?.id).toBe('weight-2.0');
    });

    it('uninstall clears installed weight mod and face stat', () => {
        const die = new Die({ faceCount: 6 });

        die.install(new DieWeightMod({ id: 'weight-2.5', faceIndex: 2, grams: 2.5 }));
        die.uninstall(DieSlotType.MOD);

        expect(die.mod).toBeNull();
        expect(die.getFaceStat(2, FACE_STAT_KEYS.WEIGHT)).toBeCloseTo(0, 6);
        expect(die.mod?.faceIndex ?? null).toBeNull();
        expect(die.mod?.id ?? null).toBeNull();
    });

    it('emits DieEquipmentChanged on install and uninstall', () => {
        const die = new Die({ faceCount: 6 });
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
