export class RecordHistory<TRecord> {
    private readonly _records: TRecord[];
    private readonly maxRecords: number;
    // Clone hook remains to support histories whose records are not yet immutable.
    // For TB-04 roll history we now pass immutable/frozen arrays and use identity storage.
    // Future simplification may remove this hook once all history records follow that model.
    private readonly cloneRecordFn: (record: TRecord) => TRecord;

    get records(): readonly TRecord[] {
        return this._records;
    }

    constructor(maxRecords = 20, cloneRecordFn: (record: TRecord) => TRecord = (record) => record) {
        this._records = [];
        this.maxRecords = Math.max(1, maxRecords);
        this.cloneRecordFn = cloneRecordFn;
    }

    push(record: TRecord): void {
        // Persist a snapshot if requested by the clone hook; otherwise store identity.
        this._records.push(this.cloneRecordFn(record));

        if (this._records.length > this.maxRecords) {
            this._records.splice(0, this._records.length - this.maxRecords);
        }
    }

    clear(): void {
        this._records.length = 0;
    }

    last(n: number): readonly TRecord[] {
        if (n <= 0) {
            return [];
        }

        return this._records.slice(-n);
    }
}