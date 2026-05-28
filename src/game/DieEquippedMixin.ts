// NOTE: This is a game-layer approximation while engine equipment remains combat-specific.
// Migration target after engine generalization:
// - Engine type: Equipment<DieSlotType, DieEquipment>
// - Engine mixin: generic EquippedMixin<DieSlotType>
// See engine/docs/EQUIPMENT_GENERALIZATION_ROADMAP.md

import Entity from '../../engine/js/entities/character/Entity';
import { EntityOptions } from '../../engine/js/entities/character/EntityOptions';
import { EntityMixin, MixinBase } from '../../engine/js/entities/character/EntityBuilder';
import Events, { GameEvent } from '../../engine/js/events';
import type { DieEquipment } from './DieEquipmentTypes';
import { DieSlotType } from './DieEquipmentTypes';

export { DieSlotType } from './DieEquipmentTypes';
export type { DieEquipment } from './DieEquipmentTypes';

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

Events.List.DieEquipmentChanged = 'DieEquipmentChanged';

export interface DieEquipmentChangedEvent extends GameEvent {
    slotType: DieSlotType;
    previous: DieEquipment | null;
    current: DieEquipment | null;
}

// ---------------------------------------------------------------------------
// Mixin interface — the capability added to Die by applying DieEquippedMixin.
// ---------------------------------------------------------------------------

export interface DieEquipped {
    getEquipped(slotType: DieSlotType): DieEquipment | null;
    install(item: DieEquipment): void;
    uninstall(slotType: DieSlotType): void;
    hasEquipped(slotType: DieSlotType): boolean;
}

// ---------------------------------------------------------------------------
// Options that can pre-populate slots at construction time.
// ---------------------------------------------------------------------------

export interface DieEquippedOptions {
    equipped?: DieEquipment[];
}

// ---------------------------------------------------------------------------
// Guard helper
// ---------------------------------------------------------------------------

export function IsDieEquipped(obj: Entity): obj is Entity & DieEquipped {
    return typeof (obj as unknown as DieEquipped).getEquipped === 'function';
}

// ---------------------------------------------------------------------------
// The mixin itself.
// ---------------------------------------------------------------------------

type SlotCollection = Partial<Record<DieSlotType, DieEquipment>>;

export const DieEquippedMixin: EntityMixin<DieEquipped> = {
    name: 'DieEquipped',
    dependencies: [],

    apply<TBase extends MixinBase<Entity>>(
        Base: TBase,
        _options: EntityOptions
    ): MixinBase<InstanceType<TBase> & DieEquipped> {
        return class DieEquippedEntity extends Base implements DieEquipped {
            private _slots: SlotCollection = {};

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            constructor(...args: any[]) {
                super(...args);

                const [options] = args as [EntityOptions & DieEquippedOptions];
                if (options?.equipped) {
                    for (const item of options.equipped) {
                        this.install(item);
                    }
                }
            }

            getEquipped(slotType: DieSlotType): DieEquipment | null {
                return this._slots[slotType] ?? null;
            }

            hasEquipped(slotType: DieSlotType): boolean {
                return this._slots[slotType] !== undefined;
            }

            install(item: DieEquipment): void {
                const previous = this._slots[item.type] ?? null;
                this._slots[item.type] = item;

                const event: DieEquipmentChangedEvent = {
                    slotType: item.type,
                    previous,
                    current: item,
                };
                Events.RaiseEvent(Events.List.DieEquipmentChanged, event);
            }

            uninstall(slotType: DieSlotType): void {
                const previous = this._slots[slotType] ?? null;
                if (!previous) return;

                delete this._slots[slotType];

                const event: DieEquipmentChangedEvent = {
                    slotType,
                    previous,
                    current: null,
                };
                Events.RaiseEvent(Events.List.DieEquipmentChanged, event);
            }

        } as unknown as MixinBase<InstanceType<TBase> & DieEquipped>;
    },

    validateOptions(options: EntityOptions): string[] | null {
        const errors: string[] = [];
        const dieOptions = options as EntityOptions & DieEquippedOptions;

        if (dieOptions.equipped !== undefined) {
            if (!Array.isArray(dieOptions.equipped)) {
                errors.push('equipped must be an array');
            } else {
                for (let i = 0; i < dieOptions.equipped.length; i++) {
                    const item = dieOptions.equipped[i];
                    if (!item || typeof item.name !== 'string' || !item.type) {
                        errors.push(`equipped[${i}] must satisfy Equippable<DieSlotType>: name (string) and type (DieSlotType)`);
                    }
                }
            }
        }

        return errors.length > 0 ? errors : null;
    },
};
