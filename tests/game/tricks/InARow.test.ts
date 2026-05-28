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

function evaluateRecordedRoll(
    evaluator: TrickEvaluator,
    rollHistory: RollHistory,
    roll: readonly DieFaceResult[]
) {
    rollHistory.push(roll);
    return evaluator.evaluateRoll(roll, rollHistory)[0];
}

describe('InARow', () => {
    it('does not fire on the first two rolls and fires on the third identical full roll', () => {
        const evaluator = new TrickEvaluator([new InARow()]);
        const rollHistory = makeRollHistory();

        expect(evaluateRecordedRoll(evaluator, rollHistory, faceResults([2, 4, 6]))).toMatchObject({ success: false, score: 0 });
        expect(evaluateRecordedRoll(evaluator, rollHistory, faceResults([2, 4, 6]))).toMatchObject({ success: false, score: 0 });
        expect(evaluateRecordedRoll(evaluator, rollHistory, faceResults([2, 4, 6]))).toMatchObject({ success: true, score: 3 });
    });

    it('uses the current streak length as the score after discovery', () => {
        const evaluator = new TrickEvaluator([new InARow()]);
        const rollHistory = makeRollHistory();
        const trick = evaluator.tricks[0];

        evaluateRecordedRoll(evaluator, rollHistory, faceResults([6, 6, 6]));
        evaluateRecordedRoll(evaluator, rollHistory, faceResults([6, 6, 6]));
        evaluateRecordedRoll(evaluator, rollHistory, faceResults([6, 6, 6]));
        const fourth = evaluateRecordedRoll(evaluator, rollHistory, faceResults([6, 6, 6]));

        expect(fourth).toMatchObject({ success: true, score: 4, isNewHighScore: true });
        expect(trick.highScore).toBe(4);
    });

    it('fails when the immediately previous roll does not match', () => {
        const evaluator = new TrickEvaluator([new InARow()]);
        const rollHistory = makeRollHistory();

        evaluateRecordedRoll(evaluator, rollHistory, faceResults([1, 1, 1]));
        evaluateRecordedRoll(evaluator, rollHistory, faceResults([2, 2, 2]));
        const result = evaluateRecordedRoll(evaluator, rollHistory, faceResults([2, 2, 2]));

        expect(result).toMatchObject({ success: false, score: 0 });
    });

    it('requires full-roll records and partial rolls break the streak', () => {
        const evaluator = new TrickEvaluator([new InARow()]);
        const rollHistory = makeRollHistory();

        evaluateRecordedRoll(evaluator, rollHistory, faceResults([5, 5, 5]));
        evaluateRecordedRoll(evaluator, rollHistory, [
            new DieFaceResult(5),
            new DieFaceResult(5),
            new DieFaceResult(5, { rolled: false }),
        ]);
        expect(evaluateRecordedRoll(evaluator, rollHistory, faceResults([5, 5, 5]))).toMatchObject({ success: false, score: 0 });

        evaluateRecordedRoll(evaluator, rollHistory, faceResults([5, 5, 5]));
        expect(evaluateRecordedRoll(evaluator, rollHistory, faceResults([5, 5, 5]))).toMatchObject({ success: true, score: 3 });
    });

    it('resets streak progress when bag content changes between rolls', () => {
        const evaluator = new TrickEvaluator([new InARow()]);
        const rollHistory = makeRollHistory();

        evaluateRecordedRoll(evaluator, rollHistory, faceResults([3, 3, 3]));
        evaluateRecordedRoll(evaluator, rollHistory, faceResults([3, 3, 3]));
        Events.RaiseEvent(TrickEvents.BAG_CHANGED, null);
        rollHistory.clear();

        expect(evaluateRecordedRoll(evaluator, rollHistory, faceResults([3, 3, 3]))).toMatchObject({ success: false, score: 0 });
    });

    it('has correct metadata', () => {
        const trick = new InARow();

        expect(trick.id).toBe('in-a-row');
        expect(trick.name).toBe('In a Row');
    });
});