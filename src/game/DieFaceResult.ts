export class DieFaceResult {
    readonly value: number;
    readonly rolled: boolean;
    readonly computed_value: number;
    readonly crit: boolean;
    readonly split: boolean;
    readonly multiplier: number;
    // Future expansion: piptype, tied to the style / face of the die.

    constructor(value: number, overrides: Partial<DieFaceResult> = {}) {
        this.value = value;
        this.rolled = overrides.rolled ?? true;
        this.crit = overrides.crit ?? false;
        this.split = overrides.split ?? false;
        this.multiplier = overrides.multiplier ?? 1;
        this.computed_value = overrides.computed_value ?? value * this.multiplier;
        Object.freeze(this);
    }

    clone(): DieFaceResult {
        // Kept for generic history callers that still request clone semantics.
        // Today this is mostly defensive API compatibility; because instances are frozen,
        // the long-term direction is to phase out clone calls and rely on immutable identity.
        return new DieFaceResult(this.value, this);
    }

    static getComputedValues(faceResults: readonly DieFaceResult[]): number[] {
        return faceResults.map((faceResult) => faceResult.computed_value);
    }

    static isFullRoll(faceResults: readonly DieFaceResult[]): boolean {
        return faceResults.every((faceResult) => faceResult.rolled);
    }
}
