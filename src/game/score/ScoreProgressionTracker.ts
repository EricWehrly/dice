import Events, { type GameEvent } from '../../../engine/js/events';
import Resource from '../../../engine/js/entities/resource';
import { Bag, type BagRolledEvent } from '../Bag';
import { TrickEvents } from '../contracts/TrickContracts';
import { ModifiedDie } from '../ModifiedDie';
import { ResourceNames } from '../resources/GameResources';

export interface ScoreUpdatedEvent extends GameEvent {
    rollScore: number;
    highScore: number;
    previousHighScore: number;
}

export class ScoreProgressionTracker {
    private readonly bag: Bag;
    private readonly unlockedMagnitudeFloor: number;

    constructor(bag: Bag, options: { unlockedMagnitudeFloor?: number } = {}) {
        this.bag = bag;
        this.unlockedMagnitudeFloor = options.unlockedMagnitudeFloor ?? 2;

        Events.Subscribe<BagRolledEvent>(
            TrickEvents.BAG_ROLLED,
            (event) => {
                this.observeRoll(event.faces);
            }
        );
    }

    private calculateBagMaxRoll(): number {
        const activeDice = this.bag.getActiveDice();
        return activeDice.reduce((sum, die) => sum + die.faceCount, 0);
    }

    getHighScore(): number {
        return Resource.Get(ResourceNames.highScore)?.value ?? 0;
    }

    observeRoll(faces: readonly number[]): void {
        const rollScore = faces.reduce((sum, face) => sum + face, 0);
        const previousHighScore = this.getHighScore();

        if (rollScore <= previousHighScore) {
            return;
        }

        Resource.Get(ResourceNames.highScore)!.value = rollScore;
        const highScore = this.getHighScore();

        Events.RaiseEvent<ScoreUpdatedEvent>(TrickEvents.SCORE_UPDATED, {
            rollScore,
            highScore,
            previousHighScore,
        });

        const fromMagnitude = Math.max(this.getDecimalMagnitude(previousHighScore), this.unlockedMagnitudeFloor);
        const toMagnitude = Math.max(this.getDecimalMagnitude(highScore), this.unlockedMagnitudeFloor);

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
