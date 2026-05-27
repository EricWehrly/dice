import { describe, expect, it } from 'vitest';
import { RecordHistory } from '../../src/game/RecordHistory';

interface FakeRecord {
    id: number;
    payload: number[];
}

describe('RecordHistory', () => {
    const cloneFakeRecord = (record: FakeRecord): FakeRecord => ({
        id: record.id,
        payload: [...record.payload],
    });

    it('stores cloned records and returns last N in insertion order', () => {
        const history = new RecordHistory<FakeRecord>(20, cloneFakeRecord);

        history.push({ id: 1, payload: [1] });
        history.push({ id: 2, payload: [2] });
        history.push({ id: 3, payload: [3] });

        expect(history.records.map((record) => record.id)).toEqual([1, 2, 3]);
        expect(history.last(2).map((record) => record.id)).toEqual([2, 3]);
    });

    it('caps history length to maxRecords', () => {
        const history = new RecordHistory<FakeRecord>(2, cloneFakeRecord);

        history.push({ id: 1, payload: [1] });
        history.push({ id: 2, payload: [2] });
        history.push({ id: 3, payload: [3] });

        expect(history.records.map((record) => record.id)).toEqual([2, 3]);
    });

    it('clears history and handles non-positive last()', () => {
        const history = new RecordHistory<FakeRecord>(20, cloneFakeRecord);
        history.push({ id: 1, payload: [1] });

        expect(history.last(0)).toEqual([]);
        history.clear();
        expect(history.records).toEqual([]);
    });
});