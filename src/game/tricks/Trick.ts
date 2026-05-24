/**
 * Abstract contract for a trick evaluation.
 * Each trick implements success detection and score calculation.
 */
export interface TrickResult {
  success: boolean;
  score: number;
}

export abstract class Trick {
  abstract readonly id: string;
  abstract readonly name: string;

  /**
   * Evaluate this trick against the given faces.
   * Returns success status and score in a single evaluation.
   */
  abstract evaluate(faces: number[]): TrickResult;
}
