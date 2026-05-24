import Events from '../../../engine/js/events';
import type { GameEvent } from '../../../engine/js/events';
import Resource from '../../../engine/js/entities/resource';
import type { BagRolledEvent } from '../Bag';
import { TrickEvents } from '../contracts/TrickContracts';
import { Trick } from './index';

export interface EvaluationResult {
    trickId: string;
    success: boolean;
    score: number;
    isFirstCompletion: boolean;
    isNewHighScore: boolean;
}

export interface RollEvaluatedEvent extends GameEvent {
    results: EvaluationResult[];
}

interface TrickDiscoveredEvent extends GameEvent {
    trickId: string;
}

interface TrickHighScoreEvent extends GameEvent {
    trickId: string;
    score: number;
}

export class TrickEvaluator {
    readonly tricks: Trick[];

    constructor(tricks: Trick[] = Trick.GetAll<Trick>()) {
        this.tricks = tricks;
        new Resource({name: 'mods', value: 0});
        new Resource({name: 'cosmetics', value: 0});

        Events.Subscribe<BagRolledEvent>(
            TrickEvents.BAG_ROLLED,
            (event) => {
                this.evaluateRoll(event.faces);
            },
            { priority: 10 }
        );
    }

    evaluateRoll(faces: number[]): void {
        const results = this.tricks.map((trick) => this.evaluateTrick(trick, faces));
        Events.RaiseEvent<RollEvaluatedEvent>(TrickEvents.ROLL_EVALUATED, { results });
    }

    private evaluateTrick(
        trick: Trick,
        faces: number[]
    ): EvaluationResult {
        const { success, score } = trick.evaluate(faces);
        const previousBest = trick.highScore;

        const isFirstCompletion = success && !trick.achieved;
        const isNewHighScore = success && trick.achieved && (previousBest === null || score > previousBest);

        if (success) {
            trick.achieved = true;

            if (isFirstCompletion) {
                Resource.Get('mods')!.value += 1;
                Events.RaiseEvent<TrickDiscoveredEvent>(TrickEvents.TRICK_DISCOVERED, { trickId: trick.id });
            }

            if (isNewHighScore) {
                Resource.Get('cosmetics')!.value += 1;
                Events.RaiseEvent<TrickHighScoreEvent>(TrickEvents.TRICK_HIGH_SCORE, {
                    trickId: trick.id,
                    score,
                });
            }
        }

        return {
            trickId: trick.id,
            success,
            score,
            isFirstCompletion,
            isNewHighScore,
        };
    }
}
