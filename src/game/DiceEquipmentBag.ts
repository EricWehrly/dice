import Events from '../../engine/js/events';
import { TrickEvents } from './contracts/TrickContracts';
import { Bag, type BagRolledEvent } from './Bag';
import { Die } from './Die';
import { DieFaceResult } from './DieFaceResult';
import { IsDieEquipped, type DieEquipped } from './DieEquippedMixin';

/**
 * DiceEquipmentBag
 * 
 * Extends Bag with field-limit logic for equipped dice management.
 * - `equippedIds` tracks which dice are fielded (max 6).
 * - `rollAll()` only rolls equipped, unlocked dice.
 * - Maintains clean separation: Bag handles add/remove, DiceEquipmentBag adds equip/unequip.
 */
export class DiceEquipmentBag extends Bag {
    readonly equippedIds: string[] = [];
    readonly EQUIPPED_LIMIT = 6;

    isEquipped(dieId: string): boolean {
        return this.equippedIds.includes(dieId);
    }

    equip(dieId: string): boolean {
        const dieExists = this.dice.some((die) => die.id === dieId);
        if (!dieExists) {
            return false;
        }

        if (this.equippedIds.includes(dieId)) {
            return true;
        }

        if (this.equippedIds.length >= this.EQUIPPED_LIMIT) {
            return false;
        }

        this.equippedIds.push(dieId);
        this.applyLaneOrdering();
        this.raiseBagChanged();
        return true;
    }

    override removeDie(id: string): void {
        const equippedIndex = this.equippedIds.indexOf(id);
        if (equippedIndex >= 0) {
            this.equippedIds.splice(equippedIndex, 1);
        }

        super.removeDie(id);
    }

    unequip(dieId: string): void {
        const idx = this.equippedIds.indexOf(dieId);
        if (idx >= 0) {
            this.equippedIds.splice(idx, 1);
            this.applyLaneOrdering();
            this.raiseBagChanged();
        }
    }

    toggleEquipped(dieId: string): boolean {
        if (this.isEquipped(dieId)) {
            this.unequip(dieId);
            return false; // Now unequipped
        } else {
            return this.equip(dieId); // Returns true if equip succeeded, false if limit hit
        }
    }

    getEquippedDice(): Die[] {
        return this.dice.filter(d => this.isEquipped(d.id));
    }

    override getActiveDice() {
        // For DiceEquipmentBag, "active" means equipped (not the old die.active flag)
        return this.getEquippedDice().filter((die): die is Die & DieEquipped => die.active && IsDieEquipped(die));
    }

    override rollAll(): number[] {
        // Only roll equipped, unlocked dice
        const equippedDice = this.getEquippedDice();
        const unlockedEquippedDice = equippedDice.filter((die) => !die.locked);
        this.applyLaneOrdering();

        unlockedEquippedDice.forEach((die) => {
            die.roll();
        });

        const faceResults = Object.freeze(
            equippedDice.map((die) => new DieFaceResult(die.faceUp, { rolled: !die.locked }))
        );
        const faces = faceResults.map((faceResult) => faceResult.computed_value);

        this.rollHistory.push(faceResults);

        Events.RaiseEvent<BagRolledEvent>(TrickEvents.BAG_ROLLED, {
            faces,
            faceResults,
            diceIds: equippedDice.map((die) => die.id),
            rollHistory: this.rollHistory,
        });

        return faces;
    }
}
