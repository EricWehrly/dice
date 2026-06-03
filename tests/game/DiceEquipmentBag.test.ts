import { describe, it, expect, beforeEach } from 'vitest';
import Events from '../../engine/js/events';
import { TrickEvents } from '../../src/game/contracts/TrickContracts';
import { DiceEquipmentBag } from '../../src/game/DiceEquipmentBag';
import { MakeDieCharacter } from '../../src/game/DieCharacterFactory';
import { DieEquippedMixin } from '../../src/game/DieEquippedMixin';

describe('DiceEquipmentBag', () => {
    let bag: DiceEquipmentBag;

    beforeEach(() => {
        bag = new DiceEquipmentBag();
    });

    describe('equip/unequip', () => {
        it('should equip a die when not at limit', () => {
            const die = MakeDieCharacter([DieEquippedMixin]);
            bag.addDie(die);

            const result = bag.equip(die.id);
            expect(result).toBe(true);
            expect(bag.isEquipped(die.id)).toBe(true);
        });

        it('should reject equip when at 6-die limit', () => {
            const dice = Array.from({ length: 7 }, () => MakeDieCharacter([DieEquippedMixin]));
            dice.forEach((die) => bag.addDie(die));

            // Equip first 6
            for (let i = 0; i < 6; i++) {
                expect(bag.equip(dice[i].id)).toBe(true);
            }

            // 7th should fail
            expect(bag.equip(dice[6].id)).toBe(false);
        });

        it('should reject equip when die id is not in bag', () => {
            expect(bag.equip('missing-die-id')).toBe(false);
        });

        it('should allow re-equipping an already equipped die even at limit', () => {
            const dice = Array.from({ length: 6 }, () => MakeDieCharacter([DieEquippedMixin]));
            dice.forEach((die) => {
                bag.addDie(die);
                bag.equip(die.id);
            });

            expect(bag.equip(dice[0].id)).toBe(true);
        });

        it('should unequip a die', () => {
            const die = MakeDieCharacter([DieEquippedMixin]);
            bag.addDie(die);
            bag.equip(die.id);

            bag.unequip(die.id);
            expect(bag.isEquipped(die.id)).toBe(false);
        });

        it('should toggle equipped state', () => {
            const die = MakeDieCharacter([DieEquippedMixin]);
            bag.addDie(die);

            expect(bag.toggleEquipped(die.id)).toBe(true); // Now equipped
            expect(bag.isEquipped(die.id)).toBe(true);

            expect(bag.toggleEquipped(die.id)).toBe(false); // Now unequipped
            expect(bag.isEquipped(die.id)).toBe(false);
        });
    });

    describe('getEquippedDice', () => {
        it('should return only equipped dice', () => {
            const die1 = MakeDieCharacter([DieEquippedMixin]);
            const die2 = MakeDieCharacter([DieEquippedMixin]);
            const die3 = MakeDieCharacter([DieEquippedMixin]);

            bag.addDie(die1);
            bag.addDie(die2);
            bag.addDie(die3);

            bag.equip(die1.id);
            bag.equip(die3.id);

            const equipped = bag.getEquippedDice();
            expect(equipped).toHaveLength(2);
            expect(equipped.map((d) => d.id)).toEqual([die1.id, die3.id]);
        });

        it('should return empty array when no dice equipped', () => {
            const die = MakeDieCharacter([DieEquippedMixin]);
            bag.addDie(die);

            expect(bag.getEquippedDice()).toHaveLength(0);
        });

        it('should remove equipped id when die is removed from bag', () => {
            const die = MakeDieCharacter([DieEquippedMixin]);
            bag.addDie(die);
            bag.equip(die.id);

            bag.removeDie(die.id);

            expect(bag.isEquipped(die.id)).toBe(false);
            expect(bag.getEquippedDice()).toHaveLength(0);
        });
    });

    describe('getActiveDice', () => {
        it('should return only equipped dice (override base behavior)', () => {
            const die1 = MakeDieCharacter([DieEquippedMixin]);
            const die2 = MakeDieCharacter([DieEquippedMixin]);

            bag.addDie(die1);
            bag.addDie(die2);

            bag.equip(die1.id);

            const active = bag.getActiveDice();
            expect(active).toHaveLength(1);
            expect(active[0].id).toBe(die1.id);
        });

        it('should assign distinct lane positions when dice are equipped', () => {
            const die1 = MakeDieCharacter([DieEquippedMixin]);
            const die2 = MakeDieCharacter([DieEquippedMixin]);
            const die3 = MakeDieCharacter([DieEquippedMixin]);

            bag.addDie(die1);
            bag.addDie(die2);
            bag.addDie(die3);

            bag.equip(die1.id);
            bag.equip(die2.id);
            bag.equip(die3.id);

            const active = bag.getActiveDice();
            expect(active.map((die) => die.position.x)).toEqual([0, 1, 2]);
        });
    });

    describe('rollAll', () => {
        it('should only roll equipped, unlocked dice', () => {
            const die1 = MakeDieCharacter([DieEquippedMixin]);
            const die2 = MakeDieCharacter([DieEquippedMixin]);
            const die3 = MakeDieCharacter([DieEquippedMixin]);

            bag.addDie(die1);
            bag.addDie(die2);
            bag.addDie(die3);

            bag.equip(die1.id);
            bag.equip(die2.id);
            bag.equip(die3.id);

            bag.toggleLocked(die2.id);

            const faces = bag.rollAll();

            // Should have rolled all 3 equipped dice
            expect(faces).toHaveLength(3);
            // But only die1 and die3 should show new values (die2 locked)
            expect(die1.faceUp).toBeDefined();
            expect(die3.faceUp).toBeDefined();
        });

        it('should fire BAG_ROLLED with only equipped dice ids', async () => {
            const die1 = MakeDieCharacter([DieEquippedMixin]);
            const die2 = MakeDieCharacter([DieEquippedMixin]);

            bag.addDie(die1);
            bag.addDie(die2);

            bag.equip(die1.id);
            const rolledEvent = new Promise<any>((resolve) => {
                Events.Subscribe(TrickEvents.BAG_ROLLED, resolve, { oneTime: true });
            });

            bag.rollAll();

            const event = await rolledEvent;
            expect(event.diceIds).toEqual([die1.id]);
        });
    });
});
