import Events, { type GameEvent } from '../../../engine/js/events';
import { Bag, type BagRolledEvent } from '../Bag';
import { TrickEvents } from '../contracts/TrickContracts';
import { ModifiedDie } from '../ModifiedDie';

export interface ScoreUpdatedEvent extends GameEvent {
    rollScore: number;
    highScore: number;
    previousHighScore: number;
}

export class ScoreProgressionTracker {
    private readonly bag: Bag;
    private highScore = 0;

    constructor(bag: Bag) {
        this.bag = bag;

        Events.Subscribe<BagRolledEvent>(
            TrickEvents.BAG_ROLLED,
            (event) => {
                this.observeRoll(event.faces);
            }
        );
    }

    observeRoll(faces: readonly number[]): void {
        const rollScore = faces.reduce((sum, face) => sum + face, 0);
        const previousHighScore = this.highScore;

        if (rollScore <= previousHighScore) {
            return;
        }

        this.highScore = rollScore;

        Events.RaiseEvent<ScoreUpdatedEvent>(TrickEvents.SCORE_UPDATED, {
            rollScore,
            highScore: this.highScore,
            previousHighScore,
        });

        const fromMagnitude = this.getDecimalMagnitude(previousHighScore);
        const toMagnitude = this.getDecimalMagnitude(this.highScore);

        if (toMagnitude <= fromMagnitude) {
            return;
        }

        const unlockedDice = toMagnitude - fromMagnitude;
        for (let index = 0; index < unlockedDice; index += 1) {
            this.bag.addDie(new ModifiedDie());
        }
    }

    private getDecimalMagnitude(score: number): number {
        if (score < 10) {
            return 0;
        }

        return Math.floor(Math.log10(score));
    }
}
