import Events, { type GameEvent } from '../../engine/js/events';
import { TrickEvents } from './contracts/TrickContracts';
import { Die } from './Die';
import { ModifiedDie } from './ModifiedDie';

export interface BagRolledEvent extends GameEvent {
    faces: number[];
    diceIds: string[];
}

export class Bag {
    readonly dice: ModifiedDie[];

    constructor(initialDice: ModifiedDie[] = [new ModifiedDie(), new ModifiedDie(), new ModifiedDie()]) {
        this.dice = [...initialDice];
    }

    rollAll(): number[] {
        const activeDice = this.getActiveDice();
        activeDice
            .filter((die) => !die.locked)
            .forEach((die) => {
                die.roll();
            });

        const faces = activeDice.map((die) => die.faceUp);

        Events.RaiseEvent<BagRolledEvent>(TrickEvents.BAG_ROLLED, {
            faces,
            diceIds: activeDice.map((die) => die.id),
        });

        return faces;
    }

    addDie(die: ModifiedDie): void {
        this.dice.push(die);
        Events.RaiseEvent(TrickEvents.BAG_CHANGED, null);
    }

    removeDie(id: string): void {
        const index = this.dice.findIndex((die) => die.id === id);
        if (index < 0) {
            return;
        }

        this.dice.splice(index, 1);
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
        Events.RaiseEvent(TrickEvents.BAG_CHANGED, null);
    }

    toggleLocked(id: string): void {
        const die = this.dice.find((item) => item.id === id);
        if (!die) {
            return;
        }

        die.locked = !die.locked;
        Events.RaiseEvent(TrickEvents.BAG_CHANGED, null);
    }
}
