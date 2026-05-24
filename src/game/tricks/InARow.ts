import { Trick, type TrickResult } from './Trick';
import { GLOBAL_MINIMUM_THRESHOLD } from './constants';

/**
 * In a Row: at least GLOBAL_MINIMUM_THRESHOLD identical face values in a contiguous streak.
 * Score: longest contiguous streak length when successful.
 */
export class InARow extends Trick {
  constructor() {
    super({ id: 'in-a-row', name: 'In a Row' });
  }

  evaluate(faces: number[]): TrickResult {
    if (faces.length < GLOBAL_MINIMUM_THRESHOLD) {
      return { success: false, score: 0 };
    }

    const longestStreak = this.longestIdenticalStreak(faces);
    const success = longestStreak >= GLOBAL_MINIMUM_THRESHOLD;

    return {
      success,
      score: success ? longestStreak : 0,
    };
  }

  private longestIdenticalStreak(faces: number[]): number {
    if (faces.length === 0) {
      return 0;
    }

    let longest = 1;
    let current = 1;

    for (let i = 1; i < faces.length; i++) {
      if (faces[i] === faces[i - 1]) {
        current += 1;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }

    return longest;
  }
}

export const inARowTrick = new InARow();