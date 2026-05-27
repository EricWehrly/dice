import { describe, expect, it, vi } from 'vitest';
import Events from '../../engine/js/events';
import { FACE_STAT_KEYS } from '../../src/game/DieStatKeys';
import { TrickEvents } from '../../src/game/contracts/TrickContracts';
import { ModifiedDie } from '../../src/game/ModifiedDie';

describe('ModifiedDie', () => {
    it('tracks installed mod and applies its stat side-effects', () => {
        const die = new ModifiedDie({
            faceCount: 6,
            mod: { faceIndex: 3, grams: 0.5, id: 'weight-0.5g' },
        });

        expect(die.mod).toMatchObject({ faceIndex: 3, grams: 0.5, id: 'weight-0.5g' });
        expect(die.getFaceStat(0, FACE_STAT_KEYS.WEIGHT)).toBeCloseTo(0, 6);
        expect(die.getFaceStat(3, FACE_STAT_KEYS.WEIGHT)).toBeCloseTo(0.5, 6);
    });

    it('addWeightMod installs a mod record and updates weight stat', () => {
        const die = new ModifiedDie({ faceCount: 6 });

        die.addWeightMod(2, 1.25);

        expect(die.mod).toMatchObject({ faceIndex: 2, grams: 1.25 });
        expect(die.getFaceStat(2, FACE_STAT_KEYS.WEIGHT)).toBeCloseTo(1.25, 6);
    });

    it('ignores invalid mod installs', () => {
        const die = new ModifiedDie({ faceCount: 6 });

        die.addWeightMod(-1, 1.0);
        die.addWeightMod(999, 1.0);
        die.addWeightMod(1, 0);
        die.addWeightMod(1, -1);

        expect(die.mod).toBeNull();
        expect(die.getFaceStat(1, FACE_STAT_KEYS.WEIGHT)).toBe(0);
    });

    it('installMod replaces previous weight target instead of stacking', () => {
        const die = new ModifiedDie({ faceCount: 6 });

        expect(die.installMod('weight-1.5', 1)).toBe(true);
        expect(die.mod).toMatchObject({ faceIndex: 1, grams: 1.5, id: 'weight-1.5' });

        expect(die.installMod('weight-2.0', 4)).toBe(true);
        expect(die.mod).toMatchObject({ faceIndex: 4, grams: 2.0, id: 'weight-2.0' });
        expect(die.getFaceStat(1, FACE_STAT_KEYS.WEIGHT)).toBeCloseTo(0, 6);
        expect(die.getFaceStat(4, FACE_STAT_KEYS.WEIGHT)).toBeCloseTo(2.0, 6);
        expect(die.getInstalledModFaceIndex()).toBe(4);
        expect(die.getInstalledWeightModId()).toBe('weight-2.0');
    });

    it('uninstallMod clears installed weight mod and face stat', () => {
        const die = new ModifiedDie({ faceCount: 6 });

        die.installMod('weight-2.5', 2);
        expect(die.uninstallMod()).toBe(true);

        expect(die.mod).toBeNull();
        expect(die.getFaceStat(2, FACE_STAT_KEYS.WEIGHT)).toBeCloseTo(0, 6);
        expect(die.getInstalledModFaceIndex()).toBeNull();
        expect(die.getInstalledWeightModId()).toBeNull();
    });

    it('emits BAG_CHANGED on install and uninstall', () => {
        const die = new ModifiedDie({ faceCount: 6 });
        const callback = vi.fn();
        const subscriptionId = Events.Subscribe(TrickEvents.BAG_CHANGED, callback);

        expect(die.installMod('weight-1.0', 0)).toBe(true);
        expect(die.uninstallMod()).toBe(true);

        expect(callback).toHaveBeenCalledTimes(2);
        if (subscriptionId) {
            Events.Unsubscribe(subscriptionId);
        }
    });
});
