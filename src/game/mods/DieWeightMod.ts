// NOTE: Implements DieEquipment (game-layer approximation of engine Equippable<DieSlotType>).
// Migrate to engine Equippable<DieSlotType> once engine generalization lands.
// See engine/docs/EQUIPMENT_GENERALIZATION_ROADMAP.md

import { DieSlotType, type DieEquipment } from '../DieEquipmentTypes';

/** Plain data shape for weight calculations — used by DiceProbability without needing the full class. */
export interface DieWeightModData {
    id?: string;
    faceIndex: number;
    grams: number;
}

export class DieWeightMod implements DieEquipment {
    readonly type = DieSlotType.MOD as const;
    readonly id: string;
    readonly name: string;
    readonly faceIndex: number;
    readonly grams: number;

    constructor({ id, name, faceIndex, grams }: DieWeightModData & { name?: string }) {
        this.id = id ?? `weight-${grams.toFixed(1)}g`;
        this.name = name ?? this.id;
        this.faceIndex = faceIndex;
        this.grams = grams;
    }
}
