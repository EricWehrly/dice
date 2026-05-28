import Events, { type GameEvent } from '../../engine/js/events';
import { TrickEvents } from './contracts/TrickContracts';
import { Die } from './Die';
import { DieFaceResult } from './DieFaceResult';
import { ModifiedDie } from './ModifiedDie';
import { RecordHistory } from './RecordHistory';
import Coordinate3D from '../../engine/js/coordinates/Coordinate3D';

export interface BagRolledEvent extends GameEvent {
    faces: number[];
    faceResults: readonly DieFaceResult[];
    diceIds: string[];
    rollHistory: RecordHistory<readonly DieFaceResult[]>;
}

export interface BagChangedEvent extends GameEvent {
    readonly bag: Readonly<Bag>;
}

// if we go to multiplayer, I think Bag either needs to be Listed or associated with player
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
            .forEach((die, index) => {
                die.position.update(new Coordinate3D(index, die.position.y, die.position.z));
                die.roll();
            });

        const faceResults = Object.freeze(activeDice.map((die) => new DieFaceResult(die.faceUp, { rolled: !die.locked })));
        const faces = faceResults.map((faceResult) => faceResult.computed_value);

        this.rollHistory.push(faceResults);

        Events.RaiseEvent<BagRolledEvent>(TrickEvents.BAG_ROLLED, {
            faces,
            faceResults,
            diceIds: activeDice.map((die) => die.id),
            rollHistory: this.rollHistory,
        });

        return faces;
    }

    addDie(die: ModifiedDie): void {
        this.dice.push(die);
        this.raiseBagChanged();
    }

    removeDie(id: string): void {
        const index = this.dice.findIndex((die) => die.id === id);
        if (index < 0) {
            return;
        }

        this.dice.splice(index, 1);
        this.rollHistory.clear();
        this.raiseBagChanged();
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
        this.raiseBagChanged();
    }

    toggleLocked(id: string): void {
        const die = this.dice.find((item) => item.id === id);
        if (!die) {
            return;
        }

        die.locked = !die.locked;
        this.raiseBagChanged();
    }

    private raiseBagChanged(): void {
        // TODO: deep freeze inside the RaiseEvent layer
        const frozenBag = Object.freeze({
            ...this,
            dice: Object.freeze([...this.dice]),
        });
        Events.RaiseEvent<BagChangedEvent>(TrickEvents.BAG_CHANGED, {
            bag: frozenBag,
        });
    }
}
