import { Trick, type TrickResult } from './Trick';
import { GLOBAL_MINIMUM_THRESHOLD } from './constants';

/**
 * Of a Kind: ALL dice must show the same face value.
 * Score: number of dice if successful.
 */
export class OfAKind extends Trick {
  id = 'of-a-kind' as const;
  name = 'Of a Kind';

  evaluate(faces: number[]): TrickResult {
    if (faces.length < GLOBAL_MINIMUM_THRESHOLD) {
      return { success: false, score: 0 };
    }

    const firstFace = faces[0];
    const allMatch = faces.every(face => face === firstFace);
    return {
      success: allMatch,
      score: allMatch ? faces.length : 0,
    };
  }
}
