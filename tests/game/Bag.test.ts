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

    it('raises BAG_CHANGED from the constructor when initialized with dice', () => {
        const callback = vi.fn();
        const subscriptionId = Events.Subscribe(TrickEvents.BAG_CHANGED, callback);

        new Bag([new Die({ faceCount: 6, id: 'd1' })]);

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

    it('sets x position to lane index on roll', () => {
        const d1 = new Die({ faceCount: 6, id: 'd1', randomizer: () => 0.2, position: { x: 99, y: 3, z: 7 } });
        const d2 = new Die({ faceCount: 6, id: 'd2', randomizer: () => 0.2, position: { x: 99, y: 4, z: 8 } });
        const d3 = new Die({ faceCount: 6, id: 'd3', randomizer: () => 0.2, position: { x: 99, y: 5, z: 9 } });
        const bag = new Bag([d1, d2, d3]);

        bag.rollAll();

        expect(d1.position.x).toBe(0);
        expect(d2.position.x).toBe(1);
        expect(d3.position.x).toBe(2);
        expect(d1.position.y).toBe(3);
        expect(d2.position.y).toBe(4);
        expect(d3.position.y).toBe(5);
        expect(d1.position.z).toBe(7);
        expect(d2.position.z).toBe(8);
        expect(d3.position.z).toBe(9);
    });

    it('sets x position to the next lane index when adding a die', () => {
        const d1 = new Die({ faceCount: 6, id: 'd1', randomizer: () => 0.2, position: { x: 99, y: 3, z: 7 } });
        const d2 = new Die({ faceCount: 6, id: 'd2', randomizer: () => 0.2, position: { x: 99, y: 4, z: 8 } });
        const bag = new Bag([d1, d2]);
        const d3 = new Die({ faceCount: 6, id: 'd3', randomizer: () => 0.2, position: { x: 99, y: 5, z: 9 } });

        bag.addDie(d3);

        expect(d1.position.x).toBe(0);
        expect(d2.position.x).toBe(1);
        expect(d3.position.x).toBe(2);
        expect(d3.position.y).toBe(5);
        expect(d3.position.z).toBe(9);
    });

    it('compacts lane positions when removing a die', () => {
        const d1 = new Die({ faceCount: 6, id: 'd1', randomizer: () => 0.2, position: { x: 99, y: 3, z: 7 } });
        const d2 = new Die({ faceCount: 6, id: 'd2', randomizer: () => 0.2, position: { x: 99, y: 4, z: 8 } });
        const d3 = new Die({ faceCount: 6, id: 'd3', randomizer: () => 0.2, position: { x: 99, y: 5, z: 9 } });
        const bag = new Bag([d1, d2, d3]);

        bag.removeDie('d2');

        expect(d1.position.x).toBe(0);
        expect(d3.position.x).toBe(1);
    });

    it('assigns locked dice to earlier lane indexes than unlocked dice', () => {
        const d1 = new Die({ faceCount: 6, id: 'd1', randomizer: () => 0.2, position: { x: 99, y: 3, z: 7 } });
        const d2 = new Die({ faceCount: 6, id: 'd2', randomizer: () => 0.2, position: { x: 99, y: 4, z: 8 } });
        const d3 = new Die({ faceCount: 6, id: 'd3', randomizer: () => 0.2, position: { x: 99, y: 5, z: 9 } });
        d3.locked = true;
        const bag = new Bag([d1, d2, d3]);

        bag.rollAll();

        expect(d3.position.x).toBe(0);
        expect(d1.position.x).toBe(1);
        expect(d2.position.x).toBe(2);
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
        // Bag constructor fires BAG_CHANGED when given initial dice, so subscribe after construction.
        const bag = new Bag([new Die({ faceCount: 6, id: 'd1' })]);

        const callback = vi.fn();
        const subscriptionId = Events.Subscribe(TrickEvents.BAG_CHANGED, callback);

        bag.toggleLocked('d1');

        expect(callback).toHaveBeenCalledTimes(1);
        const event = callback.mock.calls[0][0];
        expect(event.bag).toBeDefined();
        expect(event.bag.dice).toEqual(bag.dice);
        expect(Array.isArray(event.bag.dice)).toBe(true);

        if (subscriptionId) {
            Events.Unsubscribe(subscriptionId);
        }
    });
});
