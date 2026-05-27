import { describe, expect, it } from 'vitest';
import Events from '../../../engine/js/events';
import { TrickEvents } from '../../../src/game/contracts/TrickContracts';
import { DieFaceResult } from '../../../src/game/DieFaceResult';
import { RecordHistory } from '../../../src/game/RecordHistory';
import { InARow } from '../../../src/game/tricks/InARow';
import { TrickEvaluator } from '../../../src/game/tricks/TrickEvaluator';

type RollHistory = RecordHistory<readonly DieFaceResult[]>;

function makeRollHistory(maxRecords = 20): RollHistory {
    return new RecordHistory<readonly DieFaceResult[]>(maxRecords);
}

function faceResults(values: Array<number | [number, { rolled: boolean }]>): readonly DieFaceResult[] {
    return Object.freeze(values.map((value) => {
        if (Array.isArray(value)) {
            return new DieFaceResult(value[0], value[1]);
        }

        return new DieFaceResult(value);
    }));
}

describe('InARow', () => {
    it('does not fire on the first two rolls and fires on the third identical full roll', () => {
        const evaluator = new TrickEvaluator([new InARow()]);
        const rollHistory = makeRollHistory();

        expect(evaluator.evaluateRoll(faceResults([2, 4, 6]), rollHistory)[0]).toMatchObject({ success: false, score: 0 });
        expect(evaluator.evaluateRoll(faceResults([2, 4, 6]), rollHistory)[0]).toMatchObject({ success: false, score: 0 });
        expect(evaluator.evaluateRoll(faceResults([2, 4, 6]), rollHistory)[0]).toMatchObject({ success: true, score: 3 });
    });

    it('uses the current streak length as the score after discovery', () => {
        const evaluator = new TrickEvaluator([new InARow()]);
        const rollHistory = makeRollHistory();
        const trick = evaluator.tricks[0];

        evaluator.evaluateRoll(faceResults([6, 6, 6]), rollHistory);
        evaluator.evaluateRoll(faceResults([6, 6, 6]), rollHistory);
        evaluator.evaluateRoll(faceResults([6, 6, 6]), rollHistory);
        const fourth = evaluator.evaluateRoll(faceResults([6, 6, 6]), rollHistory)[0];

        expect(fourth).toMatchObject({ success: true, score: 4, isNewHighScore: true });
        expect(trick.highScore).toBe(4);
    });

    it('fails when the immediately previous roll does not match', () => {
        const evaluator = new TrickEvaluator([new InARow()]);
        const rollHistory = makeRollHistory();

        evaluator.evaluateRoll(faceResults([1, 1, 1]), rollHistory);
        evaluator.evaluateRoll(faceResults([2, 2, 2]), rollHistory);
        const result = evaluator.evaluateRoll(faceResults([2, 2, 2]), rollHistory)[0];

        expect(result).toMatchObject({ success: false, score: 0 });
    });

    it('requires full-roll records and partial rolls break the streak', () => {
        const evaluator = new TrickEvaluator([new InARow()]);
        const rollHistory = makeRollHistory();

        evaluator.evaluateRoll(faceResults([5, 5, 5]), rollHistory);
        evaluator.evaluateRoll([
            new DieFaceResult(5),
            new DieFaceResult(5),
            new DieFaceResult(5, { rolled: false }),
        ], rollHistory);
        expect(evaluator.evaluateRoll(faceResults([5, 5, 5]), rollHistory)[0]).toMatchObject({ success: false, score: 0 });

        evaluator.evaluateRoll(faceResults([5, 5, 5]), rollHistory);
        expect(evaluator.evaluateRoll(faceResults([5, 5, 5]), rollHistory)[0]).toMatchObject({ success: true, score: 3 });
    });

    it('resets streak progress when bag content changes between rolls', () => {
        const evaluator = new TrickEvaluator([new InARow()]);
        const rollHistory = makeRollHistory();

        evaluator.evaluateRoll(faceResults([3, 3, 3]), rollHistory);
        evaluator.evaluateRoll(faceResults([3, 3, 3]), rollHistory);
        Events.RaiseEvent(TrickEvents.BAG_CHANGED, null);
        rollHistory.clear();

        expect(evaluator.evaluateRoll(faceResults([3, 3, 3]), rollHistory)[0]).toMatchObject({ success: false, score: 0 });
    });

    it('has correct metadata', () => {
        const trick = new InARow();

        expect(trick.id).toBe('in-a-row');
        expect(trick.name).toBe('In a Row');
    });
});