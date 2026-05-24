import Listed from '../../../engine/js/baseTypes/listed';

/**
 * Abstract contract for a trick evaluation.
 * Each trick implements success detection and score calculation.
 */
export interface TrickResult {
  success: boolean;
  score: number;
}

export abstract class Trick extends Listed {
  readonly id: string;
  achieved = false;
  highScore: number | null = null;

  constructor(options: { id: string; name: string }) {
    super({ name: options.name });
    this.id = options.id;
  }

  /**
   * Evaluate this trick against the given faces.
   * Returns success status and score in a single evaluation.
   */
  abstract evaluate(faces: number[]): TrickResult;
}
