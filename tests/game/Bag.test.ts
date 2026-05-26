import { describe, expect, it, vi } from 'vitest';
import Events from '../../engine/js/events';
import { Bag } from '../../src/game/Bag';
import { TrickEvents } from '../../src/game/contracts/TrickContracts';
import { Die } from '../../src/game/Die';

describe('Bag', () => {
    it('rollAll rolls every active die', () => {
        const d1 = new Die({ faceCount: 6, id: 'd1', randomizer: () => 0.5 });
        const d2 = new Die({ faceCount: 6, id: 'd2', randomizer: () => 0.5 });
        const bag = new Bag([d1, d2]);

        const results = bag.rollAll();

        expect(results).toHaveLength(2);
        expect(d1.faceUp).toBe(4);
        expect(d2.faceUp).toBe(4);
    });

    it('does not roll inactive dice', () => {
        const d1 = new Die({ faceCount: 6, id: 'd1', randomizer: () => 0.2 });
        const d2 = new Die({ faceCount: 6, id: 'd2', randomizer: () => 0.2 });
        d2.active = false;
        const bag = new Bag([d1, d2]);

        const results = bag.rollAll();

        expect(results).toHaveLength(1);
        expect(d1.faceUp).toBe(2);
        expect(d2.faceUp).toBe(1);
    });

    it('does not reroll locked dice and still returns all active faces', () => {
        const d1 = new Die({ faceCount: 6, id: 'd1', randomizer: () => 0.8 });
        const d2 = new Die({ faceCount: 6, id: 'd2', randomizer: () => 0.8 });
        d1.faceUp = 2;
        d1.locked = true;
        const bag = new Bag([d1, d2]);

        const results = bag.rollAll();

        expect(results).toEqual([2, 5]);
        expect(d1.faceUp).toBe(2);
        expect(d2.faceUp).toBe(5);
    });

    it('raises bag rolled event', () => {
        const callback = vi.fn();
        const subscriptionId = Events.Subscribe(TrickEvents.BAG_ROLLED, callback);
        const bag = new Bag([new Die({ faceCount: 6, id: 'd1', randomizer: () => 0.2 })]);

        bag.rollAll();

        expect(callback).toHaveBeenCalledTimes(1);
        if (subscriptionId) {
            Events.Unsubscribe(subscriptionId);
        }
    });

    it('toggles active flag by id', () => {
        const d1 = new Die({ faceCount: 6, id: 'd1' });
        const bag = new Bag([d1]);

        expect(d1.active).toBe(true);
        bag.toggleActive('d1');
        expect(d1.active).toBe(false);
        bag.toggleActive('d1');
        expect(d1.active).toBe(true);
    });

    it('toggles locked flag by id', () => {
        const d1 = new Die({ faceCount: 6, id: 'd1' });
        const bag = new Bag([d1]);

        expect(d1.locked).toBe(false);
        bag.toggleLocked('d1');
        expect(d1.locked).toBe(true);
        bag.toggleLocked('d1');
        expect(d1.locked).toBe(false);
    });
});
