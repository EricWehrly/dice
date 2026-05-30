import {
    DieSlotType,
    type FaceStyleEquipment,
    type FaceStyleId,
    normalizeFaceStyleId,
} from '../DieEquipmentTypes';

export interface DieFaceStyleModData {
    id?: string;
    name?: string;
    faceStyleId: FaceStyleId | string;
}

export class DieFaceStyleMod implements FaceStyleEquipment {
    readonly type = DieSlotType.FACE_STYLE as const;
    readonly id: string;
    readonly name: string;
    readonly faceStyleId: FaceStyleId;

    constructor({ id, name, faceStyleId }: DieFaceStyleModData) {
        this.faceStyleId = normalizeFaceStyleId(faceStyleId);
        this.id = id ?? `face-style-${this.faceStyleId}`;
        this.name = name ?? this.id;
    }
}
