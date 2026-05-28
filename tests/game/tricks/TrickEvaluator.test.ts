import { describe, expect, it, vi } from 'vitest';
import Events from '../../../engine/js/events';
import { TrickEvents } from '../../../src/game/contracts/TrickContracts';
import { DieFaceResult } from '../../../src/game/DieFaceResult';
import { Ascending } from '../../../src/game/tricks/Ascending';
import { OfAKind } from '../../../src/game/tricks/OfAKind';
import { Primes } from '../../../src/game/tricks/Primes';
import { TrickEvaluator, type EvaluationResult, type RollEvaluatedEvent } from '../../../src/game/tricks/TrickEvaluator';
import { initializeGameResources } from '../../../src/game/resources/GameResources';

function createTricks() {
    return [new OfAKind(), new Ascending(), new Primes()];
}

function faceResults(values: number[]): readonly DieFaceResult[] {
    return Object.freeze(values.map((value) => new DieFaceResult(value)));
}

describe('TrickEvaluator', () => {
    it('raises trick discovered event on first completion only', () => {
        initializeGameResources(0);
        const tricks = createTricks();
        const evaluator = new TrickEvaluator(tricks);
        const callback = vi.fn();
        const subscriptionId = Events.Subscribe(TrickEvents.TRICK_DISCOVERED, callback);

        // First completion of OfAKind with score 3
        evaluator.evaluateRoll(faceResults([2, 2, 2]));

        // Second completion of OfAKind with score 2 (lower, fails minimum)
        evaluator.evaluateRoll(faceResults([3, 3, 3]));

        expect(callback).toHaveBeenCalledTimes(1);
        if (subscriptionId) {
            Events.Unsubscribe(subscriptionId);
        }
    });

    it('raises trick high-score event for post-unlock high-score improvement', () => {
        initializeGameResources(0);
        const tricks = createTricks();
        const evaluator = new TrickEvaluator(tricks);
        const callback = vi.fn();
        const subscriptionId = Events.Subscribe(TrickEvents.TRICK_HIGH_SCORE, callback);
        const ofAKind = tricks.find((trick) => trick.id === 'of-a-kind');
        if (!ofAKind) {
            throw new Error('Expected of-a-kind trick to exist');
        }

        // First completion of OfAKind with score 3
        evaluator.evaluateRoll(faceResults([2, 2, 2]));
        expect(ofAKind.highScore).toBe(3);

        // Second completion with higher score 5 (should earn cosmetic)
        evaluator.evaluateRoll(faceResults([2, 2, 2, 2, 2]));

        expect(callback).toHaveBeenCalledTimes(1);
        expect(ofAKind.highScore).toBe(5);
        if (subscriptionId) {
            Events.Unsubscribe(subscriptionId);
        }
    });

    it('detects prime-distinct only for distinct prime faces', () => {
        initializeGameResources(0);
        const tricks = createTricks();
        const evaluator = new TrickEvaluator(tricks);
        const capturedResults: EvaluationResult[][] = [];
        const subscriptionId = Events.Subscribe<RollEvaluatedEvent>(
            TrickEvents.ROLL_EVALUATED,
            (event) => {
                capturedResults.push(event.results);
            }
        );

        evaluator.evaluateRoll(faceResults([1, 2, 3, 5]));
        evaluator.evaluateRoll(faceResults([1, 2, 2, 5]));
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
