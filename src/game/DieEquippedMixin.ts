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
import { DieSlotType, type DieEquipmentLane } from './DieEquipmentTypes';
import { DieWeightMod } from './mods/DieWeightMod';

export { DieSlotType } from './DieEquipmentTypes';
export type { DieEquipment } from './DieEquipmentTypes';

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

Events.List.DieEquipmentChanged = 'DieEquipmentChanged';

export interface DieEquipmentChangedEvent extends GameEvent {
    entity: Entity & DieEquipped;
    slot: DieEquipmentLane;
    slotType: DieSlotType;
    previous: DieEquipment | null;
    current: DieEquipment | null;
    previousId: string | null;
    currentId: string | null;
}

export interface DieEquipmentInstallOptions {
    faceIndex?: number;
}

// ---------------------------------------------------------------------------
// Mixin interface — the capability added to Die by applying DieEquippedMixin.
// ---------------------------------------------------------------------------

export interface DieEquipped {
    getEquipped(slotType: DieSlotType): DieEquipment | null;
    install(item: DieEquipment, options: DieEquipmentInstallOptions): boolean;
    uninstall(slotType: DieSlotType): boolean;
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

interface WeightAdjustableDie {
    adjustFaceWeight(faceIndex: number, delta: number): void;
}

function isWeightAdjustableDie(entity: unknown): entity is WeightAdjustableDie {
    return typeof (entity as WeightAdjustableDie)?.adjustFaceWeight === 'function';
}

function toEquipmentLane(slotType: DieSlotType): DieEquipmentLane {
    switch (slotType) {
        case DieSlotType.MOD:
            return 'mod';
        case DieSlotType.FACE_STYLE:
            return 'faceStyle';
        case DieSlotType.BODY_STYLE:
            return 'bodyStyle';
    }
}

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

            install(item: DieEquipment, options: DieEquipmentInstallOptions = {}): boolean {
                const previous = this._slots[item.type] ?? null;

                if (item.type === DieSlotType.MOD && isWeightAdjustableDie(this)) {
                    if (previous instanceof DieWeightMod) {
                        this.adjustFaceWeight(previous.faceIndex, -previous.grams);
                    }
                    if (item instanceof DieWeightMod) {
                        this.adjustFaceWeight(item.faceIndex, item.grams);
                    }
                }

                this._slots[item.type] = item;

                const event: DieEquipmentChangedEvent = {
                    entity: this as unknown as Entity & DieEquipped,
                    slot: toEquipmentLane(item.type),
                    slotType: item.type,
                    previous,
                    current: item,
                    previousId: previous?.id ?? null,
                    currentId: item.id,
                };
                Events.RaiseEvent(Events.List.DieEquipmentChanged, event);
                return true;
            }

            uninstall(slotType: DieSlotType): boolean {
                const previous = this._slots[slotType] ?? null;
                if (!previous) return false;

                if (slotType === DieSlotType.MOD && isWeightAdjustableDie(this) && previous instanceof DieWeightMod) {
                    this.adjustFaceWeight(previous.faceIndex, -previous.grams);
                }

                delete this._slots[slotType];

                const event: DieEquipmentChangedEvent = {
                    entity: this as unknown as Entity & DieEquipped,
                    slot: toEquipmentLane(slotType),
                    slotType,
                    previous,
                    current: null,
                    previousId: previous.id,
                    currentId: null,
                };
                Events.RaiseEvent(Events.List.DieEquipmentChanged, event);
                return true;
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
                    if (!item || typeof item.id !== 'string' || typeof item.name !== 'string' || !item.type) {
                        errors.push(`equipped[${i}] must satisfy Equippable<DieSlotType>: id (string), name (string), and type (DieSlotType)`);
                    }
                }
            }
        }

        return errors.length > 0 ? errors : null;
    },
};
