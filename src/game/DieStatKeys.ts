export const DIE_STAT_KEYS = {
    QUALITY: 'quality',
} as const;

export const FACE_STAT_KEYS = {
    WEIGHT: 'weight',
} as const;

export type DieStatKey = typeof DIE_STAT_KEYS[keyof typeof DIE_STAT_KEYS] | string;
export type FaceStatKey = typeof FACE_STAT_KEYS[keyof typeof FACE_STAT_KEYS] | string;
