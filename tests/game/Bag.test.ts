import { describe, expect, it, vi } from 'vitest';
import Events from '../../engine/js/events';
import { Bag } from '../../src/game/Bag';
import { TrickEvents } from '../../src/game/contracts/TrickContracts';
import { ModifiedDie as Die } from '../../src/game/ModifiedDie';

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

    it('stores roll history entries with face result fields needed by tricks', () => {
        const lockedDie = new Die({ faceCount: 6, id: 'd1', randomizer: () => 0.8 });
        const rolledDie = new Die({ faceCount: 6, id: 'd2', randomizer: () => 0.8 });
        lockedDie.faceUp = 2;
        lockedDie.locked = true;
        const bag = new Bag([lockedDie, rolledDie]);

        bag.rollAll();

        const record = bag.rollHistory.records[0];
        expect(record).toHaveLength(2);
        expect(record[0].rolled).toBe(false);
        expect(record[0].computed_value).toBe(2);
        expect(record[1].rolled).toBe(true);
        expect(record[1].computed_value).toBe(5);
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

    it('raises BAG_CHANGED with bag on event payload', () => {
        const callback = vi.fn();
        const subscriptionId = Events.Subscribe(TrickEvents.BAG_CHANGED, callback);
        const bag = new Bag([new Die({ faceCount: 6, id: 'd1' })]);

        bag.toggleLocked('d1');

        expect(callback).toHaveBeenCalledTimes(1);
        const event = callback.mock.calls[0][0];
        expect(event.bag).toBeDefined();
        expect(event.bag).toBe(bag);
        expect(Array.isArray(event.bag.getActiveDice())).toBe(true);

        if (subscriptionId) {
            Events.Unsubscribe(subscriptionId);
        }
    });
});
