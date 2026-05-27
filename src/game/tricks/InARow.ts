import { DieFaceResult } from '../DieFaceResult';
import { Trick, type TrickEvaluationContext, type TrickResult } from './Trick';
import { GLOBAL_MINIMUM_THRESHOLD } from './constants';

export class InARow extends Trick {
    constructor() {
        super({ id: 'in-a-row', name: 'In a Row' });
    }

    evaluate(_faces: number[], context?: TrickEvaluationContext): TrickResult {
        if (!context?.currentRoll || !DieFaceResult.isFullRoll(context.currentRoll)) {
            return { success: false, score: 0 };
        }

        const streakLength = this.getStreakLength(context);
        const success = streakLength >= GLOBAL_MINIMUM_THRESHOLD;

        return {
            success,
            score: success ? streakLength : 0,
        };
    }

    private getStreakLength(context: TrickEvaluationContext): number {
        const currentRoll = context.currentRoll;
        if (!currentRoll) {
            return 0;
        }

        const rollHistory = context.rollHistory;
        if (!rollHistory) {
            return 1;
        }

        let streakLength = 1;
        let candidate = currentRoll;
        let startIndex = rollHistory.records.length - 1;

        // Bag-owned history can already contain this exact roll by reference.
        // Skip that entry so we only count prior rolls in the streak scan.
        if (startIndex >= 0 && rollHistory.records[startIndex] === currentRoll) {
            startIndex -= 1;
        }

        for (let index = startIndex; index >= 0; index -= 1) {
            const record = rollHistory.records[index];
            if (!DieFaceResult.isFullRoll(record) || !this.sameRoll(candidate, record)) {
                break;
            }

            streakLength += 1;
            candidate = record;
        }

        return streakLength;
    }

    private sameRoll(a: readonly DieFaceResult[], b: readonly DieFaceResult[]): boolean {
        if (a.length !== b.length) {
            return false;
        }

        for (let index = 0; index < a.length; index += 1) {
            if (a[index].computed_value !== b[index].computed_value) {
                return false;
            }
        }

        return true;
    }
}

export const inARowTrick = new InARow();