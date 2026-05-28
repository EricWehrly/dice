import { describe, expect, it, vi } from 'vitest';
import Events from '../../../engine/js/events';
import { Bag } from '../../../src/game/Bag';
import { TrickEvents } from '../../../src/game/contracts/TrickContracts';
import { ScoreProgressionTracker } from '../../../src/game/score/ScoreProgressionTracker';
import { initializeGameResources } from '../../../src/game/resources/GameResources';

describe('ScoreProgressionTracker', () => {
    it('emits score updates only when a new high score is reached', () => {
        const bag = new Bag();
        const initialHighScore = bag.getActiveDice().reduce((sum, die) => sum + die.faceCount, 0);
        initializeGameResources(initialHighScore);
        const tracker = new ScoreProgressionTracker(bag);
        const scoreCallback = vi.fn();
        const scoreSubscription = Events.Subscribe(TrickEvents.SCORE_UPDATED, scoreCallback);

        tracker.observeRoll([6, 6, 6]);
        tracker.observeRoll([1, 1, 1]);
        tracker.observeRoll([7, 6, 6]);

        expect(scoreCallback).toHaveBeenCalledTimes(1);
        expect(scoreCallback.mock.calls[0][0].highScore).toBe(19);

        if (scoreSubscription) {
            Events.Unsubscribe(scoreSubscription);
        }
    });

    it('does not add dice for 10s/100s tiers and adds one die at 1000s tier', () => {
        const bag = new Bag();
        const initialHighScore = bag.getActiveDice().reduce((sum, die) => sum + die.faceCount, 0);
        initializeGameResources(initialHighScore);
        const tracker = new ScoreProgressionTracker(bag);
        const scoreCallback = vi.fn();

        const scoreSubscription = Events.Subscribe(TrickEvents.SCORE_UPDATED, scoreCallback);

        const beforeDiceCount = bag.dice.length;

        tracker.observeRoll([99, 1, 0]);

        expect(bag.dice.length).toBe(beforeDiceCount);

        tracker.observeRoll([500, 500, 1]);

        expect(scoreCallback).toHaveBeenCalledTimes(2);
        expect(bag.dice.length).toBe(beforeDiceCount + 1);

        if (scoreSubscription) {
            Events.Unsubscribe(scoreSubscription);
        }
    });
});
