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

describe('InARow', () => {
    it('does not fire on the first two rolls and fires on the third identical full roll', () => {
        const evaluator = new TrickEvaluator([new InARow()], makeRollHistory());

        expect(evaluator.evaluateRoll([2, 4, 6])[0]).toMatchObject({ success: false, score: 0 });
        expect(evaluator.evaluateRoll([2, 4, 6])[0]).toMatchObject({ success: false, score: 0 });
        expect(evaluator.evaluateRoll([2, 4, 6])[0]).toMatchObject({ success: true, score: 3 });
    });

    it('uses the current streak length as the score after discovery', () => {
        const evaluator = new TrickEvaluator([new InARow()], makeRollHistory());
        const trick = evaluator.tricks[0];

        evaluator.evaluateRoll([6, 6, 6]);
        evaluator.evaluateRoll([6, 6, 6]);
        evaluator.evaluateRoll([6, 6, 6]);
        const fourth = evaluator.evaluateRoll([6, 6, 6])[0];

        expect(fourth).toMatchObject({ success: true, score: 4, isNewHighScore: true });
        expect(trick.highScore).toBe(4);
    });

    it('fails when the immediately previous roll does not match', () => {
        const evaluator = new TrickEvaluator([new InARow()], makeRollHistory());

        evaluator.evaluateRoll([1, 1, 1]);
        evaluator.evaluateRoll([2, 2, 2]);
        const result = evaluator.evaluateRoll([2, 2, 2])[0];

        expect(result).toMatchObject({ success: false, score: 0 });
    });

    it('requires full-roll records and partial rolls break the streak', () => {
        const evaluator = new TrickEvaluator([new InARow()], makeRollHistory());

        evaluator.evaluateRoll([5, 5, 5]);
        evaluator.evaluateRoll([
            new DieFaceResult(5),
            new DieFaceResult(5),
            new DieFaceResult(5, { rolled: false }),
        ]);
        expect(evaluator.evaluateRoll([5, 5, 5])[0]).toMatchObject({ success: false, score: 0 });

        evaluator.evaluateRoll([5, 5, 5]);
        expect(evaluator.evaluateRoll([5, 5, 5])[0]).toMatchObject({ success: true, score: 3 });
    });

    it('resets streak progress when bag content changes between rolls', () => {
        const evaluator = new TrickEvaluator([new InARow()], makeRollHistory());

        evaluator.evaluateRoll([3, 3, 3]);
        evaluator.evaluateRoll([3, 3, 3]);
        Events.RaiseEvent(TrickEvents.BAG_CHANGED, null);

        expect(evaluator.evaluateRoll([3, 3, 3])[0]).toMatchObject({ success: false, score: 0 });
    });

    it('has correct metadata', () => {
        const trick = new InARow();

        expect(trick.id).toBe('in-a-row');
        expect(trick.name).toBe('In a Row');
    });
});