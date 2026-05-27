import Events from '../../../engine/js/events';
import type { GameEvent } from '../../../engine/js/events';
import Resource from '../../../engine/js/entities/resource';
import type { BagRolledEvent } from '../Bag';
import { TrickEvents } from '../contracts/TrickContracts';
import { Trick } from './index';
import type { TrickEvaluationContext } from './Trick';

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

    constructor(tricks?: Trick[]) {
        this.tricks = tricks || Trick.GetAll<Trick>();
        if (!Resource.Get('mods')) {
            new Resource({ name: 'mods', value: 0 });
        }
        if (!Resource.Get('cosmetics')) {
            new Resource({ name: 'cosmetics', value: 0 });
        }

        Events.Subscribe<BagRolledEvent>(
            TrickEvents.BAG_ROLLED,
            (event) => {
                this.evaluateRoll(event.faceResults, event.rollHistory);
            },
            { priority: 10 }
        );
    }

    evaluateRoll(
        roll: BagRolledEvent['faceResults'],
        rollHistory?: BagRolledEvent['rollHistory']
    ): EvaluationResult[] {
        const evaluationContext: TrickEvaluationContext = {
            rollHistory,
            currentRoll: roll,
        };

        const faces = roll.map((faceResult) => faceResult.computed_value);
        const results = this.tricks.map((trick) => this.evaluateTrick(trick, faces, evaluationContext));
        Events.RaiseEvent<RollEvaluatedEvent>(TrickEvents.ROLL_EVALUATED, { results });

        return results;
    }

    private evaluateTrick(
        trick: Trick,
        faces: number[],
        context?: TrickEvaluationContext
    ): EvaluationResult {
        const { success, score } = trick.evaluate(faces, context);

        const isFirstCompletion = success && !trick.achieved;
        const isNewHighScore = trick.achieved && (trick.highScore === null || score > trick.highScore);

        if (success) {
            trick.achieved = true;
            if (trick.highScore === null || score > trick.highScore) {
                trick.highScore = score;
            }

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
