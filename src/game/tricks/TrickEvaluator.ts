import Events from '../../../engine/js/events';
import type { GameEvent } from '../../../engine/js/events';
import Resource from '../../../engine/js/entities/resource';
import type { BagRolledEvent } from '../Bag';
import { DieFaceResult } from '../DieFaceResult';
import { RecordHistory } from '../RecordHistory';
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
    readonly rollHistory: RecordHistory<readonly DieFaceResult[]>;

    constructor(tricks?: Trick[], rollHistory?: RecordHistory<readonly DieFaceResult[]>) {
        this.tricks = tricks || Trick.GetAll<Trick>();
        this.rollHistory = rollHistory || new RecordHistory<readonly DieFaceResult[]>(20);
        if (!Resource.Get('mods')) {
            new Resource({ name: 'mods', value: 0 });
        }
        if (!Resource.Get('cosmetics')) {
            new Resource({ name: 'cosmetics', value: 0 });
        }

        Events.Subscribe<BagRolledEvent>(
            TrickEvents.BAG_ROLLED,
            (event) => {
                this.evaluateRoll(event.faceResults, { persistHistory: false });
            },
            { priority: 10 }
        );

        Events.Subscribe(TrickEvents.BAG_CHANGED, () => {
            this.rollHistory.clear();
        });
    }

    evaluateRoll(
        roll: number[] | readonly DieFaceResult[],
        options: { persistHistory?: boolean } = {}
    ): EvaluationResult[] {
        const faceResults = this.normalizeFaceResults(roll);
        const faces = DieFaceResult.getComputedValues(faceResults);
        const evaluationContext: TrickEvaluationContext = {
            rollHistory: this.rollHistory,
            currentRoll: faceResults,
        };

        const results = this.tricks.map((trick) => this.evaluateTrick(trick, faces, evaluationContext));
        Events.RaiseEvent<RollEvaluatedEvent>(TrickEvents.ROLL_EVALUATED, { results });

        if (options.persistHistory ?? true) {
            this.rollHistory.push(faceResults);
        }

        return results;
    }

    private normalizeFaceResults(roll: number[] | readonly DieFaceResult[]): readonly DieFaceResult[] {
        if (roll.length === 0) {
            return [];
        }

        const firstResult = roll[0];
        if (typeof firstResult === 'number') {
            return Object.freeze((roll as number[]).map((value) => new DieFaceResult(value)));
        }

        const faceResults = roll as readonly DieFaceResult[];
        return Object.isFrozen(faceResults) ? faceResults : Object.freeze([...faceResults]);
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
