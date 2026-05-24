import { describe, expect, it, vi } from 'vitest';
import Events from '../../../engine/js/events';
import { Bag } from '../../../src/game/Bag';
import { TrickEvents } from '../../../src/game/contracts/TrickContracts';
import { ScoreProgressionTracker } from '../../../src/game/score/ScoreProgressionTracker';

describe('ScoreProgressionTracker', () => {
    it('emits score updates only when a new high score is reached', () => {
        const bag = new Bag();
        const tracker = new ScoreProgressionTracker(bag);
        const scoreCallback = vi.fn();
        const scoreSubscription = Events.Subscribe(TrickEvents.SCORE_UPDATED, scoreCallback);

        tracker.observeRoll([6, 1, 5]);
        tracker.observeRoll([1, 1, 1]);
        tracker.observeRoll([6, 6, 6]);

        expect(scoreCallback).toHaveBeenCalledTimes(2);
        expect(scoreCallback.mock.calls[0][0].highScore).toBe(12);
        expect(scoreCallback.mock.calls[1][0].highScore).toBe(18);

        if (scoreSubscription) {
            Events.Unsubscribe(scoreSubscription);
        }
    });

    it('adds one die when high score enters double digits', () => {
        const bag = new Bag();
        const tracker = new ScoreProgressionTracker(bag);
        const scoreCallback = vi.fn();

        const scoreSubscription = Events.Subscribe(TrickEvents.SCORE_UPDATED, scoreCallback);

        const beforeDiceCount = bag.dice.length;

        tracker.observeRoll([3, 3, 3]);
        tracker.observeRoll([6, 1, 5]);

        expect(scoreCallback).toHaveBeenCalledTimes(2);
        expect(bag.dice.length).toBe(beforeDiceCount + 1);

        if (scoreSubscription) {
            Events.Unsubscribe(scoreSubscription);
        }
    });
});
