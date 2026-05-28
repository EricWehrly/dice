// NOTE: This is a game-layer approximation of equipment. The engine's Equipment layer is
// currently combat-specific. See engine/docs/EQUIPMENT_GENERALIZATION_ROADMAP.md for
// the plan to generalize it. Once that lands, upgrade to:
//   import type { Equippable } from '../../engine/js/baseTypes/Equippable';

/** Generic equippable item contract — will align with engine Equippable<TSlotKey> */
export interface Equippable<TSlotKey extends string> {
    name: string;
    type: TSlotKey;
}

export enum DieSlotType {
    MOD = 'MOD',
    FACE_STYLE = 'FACE_STYLE',
    BODY_STYLE = 'BODY_STYLE',
}

export type DieEquipment = Equippable<DieSlotType>;
