import Events, { type GameEvent } from '../../engine/js/events';
import { TrickEvents } from './contracts/TrickContracts';
import { Die } from './Die';
import { DieFaceResult } from './DieFaceResult';
import { ModifiedDie } from './ModifiedDie';
import { RecordHistory } from './RecordHistory';

export interface BagRolledEvent extends GameEvent {
    faces: number[];
    faceResults: readonly DieFaceResult[];
    diceIds: string[];
}

export class Bag {
    readonly dice: ModifiedDie[];
    readonly rollHistory: RecordHistory<readonly DieFaceResult[]>;

    constructor(initialDice: ModifiedDie[] = [new ModifiedDie(), new ModifiedDie(), new ModifiedDie()]) {
        this.dice = [...initialDice];
        this.rollHistory = new RecordHistory<readonly DieFaceResult[]>(20);
    }

    rollAll(): number[] {
        const activeDice = this.getActiveDice();
        const unlockedActiveDice = activeDice.filter((die) => !die.locked);
        unlockedActiveDice
            .forEach((die) => {
                die.roll();
            });

        const faceResults = Object.freeze(activeDice.map((die) => new DieFaceResult(die.faceUp, { rolled: !die.locked })));
        const faces = faceResults.map((faceResult) => faceResult.computed_value);

        Events.RaiseEvent<BagRolledEvent>(TrickEvents.BAG_ROLLED, {
            faces,
            faceResults,
            diceIds: activeDice.map((die) => die.id),
        });

        this.rollHistory.push(faceResults);

        return faces;
    }

    addDie(die: ModifiedDie): void {
        this.dice.push(die);
        this.rollHistory.clear();
        Events.RaiseEvent(TrickEvents.BAG_CHANGED, null);
    }

    removeDie(id: string): void {
        const index = this.dice.findIndex((die) => die.id === id);
        if (index < 0) {
            return;
        }

        this.dice.splice(index, 1);
        this.rollHistory.clear();
        Events.RaiseEvent(TrickEvents.BAG_CHANGED, null);
    }

    getActiveDice(): Die[] {
        return this.dice.filter((die) => die.active);
    }

    toggleActive(id: string): void {
        const die = this.dice.find((item) => item.id === id);
        if (!die) {
            return;
        }

        die.active = !die.active;
        this.rollHistory.clear();
        Events.RaiseEvent(TrickEvents.BAG_CHANGED, null);
    }

    toggleLocked(id: string): void {
        const die = this.dice.find((item) => item.id === id);
        if (!die) {
            return;
        }

        die.locked = !die.locked;
        this.rollHistory.clear();
        Events.RaiseEvent(TrickEvents.BAG_CHANGED, null);
    }
}
