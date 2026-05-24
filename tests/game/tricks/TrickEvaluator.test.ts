import { describe, expect, it, vi } from 'vitest';
import Events from '../../../engine/js/events';
import { TrickEvents } from '../../../src/game/contracts/TrickContracts';
import { Ascending } from '../../../src/game/tricks/Ascending';
import { OfAKind } from '../../../src/game/tricks/OfAKind';
import { Primes } from '../../../src/game/tricks/Primes';
import { TrickEvaluator, type EvaluationResult, type RollEvaluatedEvent } from '../../../src/game/tricks/TrickEvaluator';

function createTricks() {
    return [new OfAKind(), new Ascending(), new Primes()];
}

describe('TrickEvaluator', () => {
    it('raises trick discovered event on first completion only', () => {
        const tricks = createTricks();
        const evaluator = new TrickEvaluator(tricks);
        const callback = vi.fn();
        const subscriptionId = Events.Subscribe(TrickEvents.TRICK_DISCOVERED, callback);

        // First completion of OfAKind with score 3
        evaluator.evaluateRoll([2, 2, 2]);

        // Second completion of OfAKind with score 2 (lower, fails minimum)
        evaluator.evaluateRoll([3, 3, 3]);

        expect(callback).toHaveBeenCalledTimes(1);
        if (subscriptionId) {
            Events.Unsubscribe(subscriptionId);
        }
    });

    it('raises trick high-score event for post-unlock high-score improvement', () => {
        const tricks = createTricks();
        const evaluator = new TrickEvaluator(tricks);
        const callback = vi.fn();
        const subscriptionId = Events.Subscribe(TrickEvents.TRICK_HIGH_SCORE, callback);
        const ofAKind = tricks.find((trick) => trick.id === 'of-a-kind');
        if (!ofAKind) {
            throw new Error('Expected of-a-kind trick to exist');
        }

        // First completion of OfAKind with score 3
        evaluator.evaluateRoll([2, 2, 2]);
        expect(ofAKind.highScore).toBe(3);

        // Second completion with higher score 5 (should earn cosmetic)
        evaluator.evaluateRoll([2, 2, 2, 2, 2]);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(ofAKind.highScore).toBe(5);
        if (subscriptionId) {
            Events.Unsubscribe(subscriptionId);
        }
    });

    it('detects prime-distinct only for distinct prime faces', () => {
        const tricks = createTricks();
        const evaluator = new TrickEvaluator(tricks);
        const capturedResults: EvaluationResult[][] = [];
        const subscriptionId = Events.Subscribe<RollEvaluatedEvent>(
            TrickEvents.ROLL_EVALUATED,
            (event) => {
                capturedResults.push(event.results);
            }
        );

        evaluator.evaluateRoll([1, 2, 3, 5]);
        evaluator.evaluateRoll([1, 2, 2, 5]);
        const [valid, invalid] = capturedResults;

        const validResult = valid.find((item) => item.trickId === 'prime-distinct');
        const invalidResult = invalid.find((item) => item.trickId === 'prime-distinct');

        expect(validResult?.success).toBe(true);
        expect(invalidResult?.success).toBe(false);
        if (subscriptionId) {
            Events.Unsubscribe(subscriptionId);
        }
    });
});
