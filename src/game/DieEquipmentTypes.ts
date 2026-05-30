// NOTE: This is a game-layer approximation of equipment. The engine's Equipment layer is
// currently combat-specific. See engine/docs/EQUIPMENT_GENERALIZATION_ROADMAP.md for
// the plan to generalize it. Once that lands, upgrade to:
//   import type { Equippable } from '../../engine/js/baseTypes/Equippable';

/** Generic equippable item contract — will align with engine Equippable<TSlotKey> */
export interface Equippable<TSlotKey extends string> {
    id: string;
    name: string;
    type: TSlotKey;
}

export const FACE_STYLE_IDS = ['none', 'circle', 'lock', 'x', 'clover'] as const;
export type FaceStyleId = typeof FACE_STYLE_IDS[number];

export function isFaceStyleId(value: string): value is FaceStyleId {
    return (FACE_STYLE_IDS as readonly string[]).includes(value);
}

export function normalizeFaceStyleId(value: string | null | undefined): FaceStyleId {
    if (!value) {
        return 'circle';
    }

    return isFaceStyleId(value) ? value : 'circle';
}

export enum DieSlotType {
    MOD = 'MOD',
    FACE_STYLE = 'FACE_STYLE',
    BODY_STYLE = 'BODY_STYLE',
}

export type DieEquipmentLane = 'mod' | 'faceStyle' | 'bodyStyle';

export interface FaceStyleEquipment extends Equippable<DieSlotType.FACE_STYLE> {
    faceStyleId: FaceStyleId;
}

export type DieEquipment =
    | Equippable<DieSlotType.MOD>
    | FaceStyleEquipment
    | Equippable<DieSlotType.BODY_STYLE>;
