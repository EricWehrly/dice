import { Trick, type TrickResult } from './Trick';
import { GLOBAL_MINIMUM_THRESHOLD } from './constants';

/**
 * Ascending: Consecutive numbers in sequence.
 * Requires at least GLOBAL_MINIMUM_THRESHOLD dice in input, with ALL dice forming a consecutive run.
 * Score: Length of the run (number of dice).
 */
export class Ascending extends Trick {
  id = 'ascending' as const;
  name = 'Ascending';

  evaluate(faces: number[]): TrickResult {
    if (faces.length < GLOBAL_MINIMUM_THRESHOLD) {
      return { success: false, score: 0 };
    }
    const longestRun = this.longestRun(faces);
    // Success only if all dice participate in the run
    const success = longestRun === faces.length && longestRun >= GLOBAL_MINIMUM_THRESHOLD;
    return {
      success,
      score: success ? longestRun : 0,
    };
  }

  private longestRun(faces: number[]): number {
    if (faces.length === 0) {
      return 0;
    }

    const sorted = [...faces].sort((a, b) => a - b);
    let maxRun = 1;
    let currentRun = 1;

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === sorted[i - 1] + 1) {
        currentRun++;
        maxRun = Math.max(maxRun, currentRun);
      } else if (sorted[i] !== sorted[i - 1]) {
        // discontinuity; reset
        currentRun = 1;
      }
      // if equal, continue current run (dupes don't break it)
    }

    return maxRun;
  }
}
