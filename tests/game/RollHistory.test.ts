import { describe, expect, it } from 'vitest';
import { DieFaceResult } from '../../src/game/DieFaceResult';
import { RecordHistory } from '../../src/game/RecordHistory';
type RollHistory = RecordHistory<readonly DieFaceResult[]>;

function makeRollHistory(maxRecords = 20): RollHistory {
    return new RecordHistory<readonly DieFaceResult[]>(maxRecords);
}

describe('RollHistory', () => {
    it('stores frozen die face result arrays for history playback', () => {
        const history = makeRollHistory();
        const original = Object.freeze([new DieFaceResult(1), new DieFaceResult(2), new DieFaceResult(3)]);

        history.push(original);
        const stored = history.records[0];
        expect(stored).toBe(original);
        expect(Object.isFrozen(stored)).toBe(true);
    });

    it('caps records to the configured history window', () => {
        const history = makeRollHistory(2);

        history.push(Object.freeze([new DieFaceResult(1)]));
        history.push(Object.freeze([new DieFaceResult(2)]));
        history.push(Object.freeze([new DieFaceResult(3)]));

        expect(history.records.map((record) => record[0].value)).toEqual([2, 3]);
    });
});