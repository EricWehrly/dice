import { Die, type DieOptions } from './Die';
import { FACE_STAT_KEYS, type DieStatKey, type FaceStatKey } from './DieStatKeys';

export type DieStats = Record<string, number>;

export interface DieWeightMod {
    id?: string;
    faceIndex: number;
    grams: number;
}

export interface DieCoreMod {
    id: string;
}

export interface ModifiedDieOptions extends DieOptions {
    stats?: DieStats;
    faceStats?: DieStats[];
    mods?: DieWeightMod[];
    coreMods?: DieCoreMod[];
}

export class ModifiedDie extends Die {
    readonly stats: DieStats;
    readonly mods: DieWeightMod[];
    readonly coreMods: DieCoreMod[];
    private readonly faceStats: DieStats[];

    constructor({ stats = {}, faceStats = [], mods = [], coreMods = [], ...dieOptions }: ModifiedDieOptions = {}) {
        super(dieOptions);
        this.stats = { ...stats };
        this.faceStats = Array.from({ length: this.faceCount }, (_, index) => ({ ...(faceStats[index] ?? {}) }));
        this.mods = [];

        for (const mod of mods) {
            this.addWeightMod(mod.faceIndex, mod.grams, mod.id);
        }

        this.coreMods = [...coreMods];
    }

    getStat(stat: DieStatKey): number {
        return this.stats[stat] ?? 0;
    }

    getFaceStat(faceIndex: number, stat: FaceStatKey, fallback = 0): number {
        if (!Number.isInteger(faceIndex) || faceIndex < 0 || faceIndex >= this.faceCount) {
            return fallback;
        }

        return this.faceStats[faceIndex][stat] ?? fallback;
    }

    addWeightMod(faceIndex: number, grams: number, id?: string): void {
        if (!Number.isInteger(faceIndex) || faceIndex < 0 || faceIndex >= this.faceCount) {
            return;
        }
        if (!Number.isFinite(grams) || grams <= 0) {
            return;
        }

        this.mods.push({
            id: id ?? `weight-${grams.toFixed(1)}g`,
            faceIndex,
            grams,
        });
        this.addFaceStat(faceIndex, FACE_STAT_KEYS.WEIGHT, grams);
    }

    addCoreMod(id: string): void {
        if (!id) {
            return;
        }

        this.coreMods.push({ id });
    }

    private setStat(stat: DieStatKey, value: number): void {
        if (!Number.isFinite(value)) {
            return;
        }

        this.stats[stat] = value;
    }

    private addStat(stat: DieStatKey, delta: number): void {
        if (!Number.isFinite(delta)) {
            return;
        }

        const next = this.getStat(stat) + delta;
        this.setStat(stat, next);
    }

    private setFaceStat(faceIndex: number, stat: FaceStatKey, value: number): void {
        if (!Number.isInteger(faceIndex) || faceIndex < 0 || faceIndex >= this.faceCount) {
            return;
        }
        if (!Number.isFinite(value)) {
            return;
        }

        this.faceStats[faceIndex][stat] = value;
    }

    private addFaceStat(faceIndex: number, stat: FaceStatKey, delta: number): void {
        if (!Number.isInteger(faceIndex) || faceIndex < 0 || faceIndex >= this.faceCount) {
            return;
        }
        if (!Number.isFinite(delta)) {
            return;
        }

        const next = this.getFaceStat(faceIndex, stat, 0) + delta;
        this.setFaceStat(faceIndex, stat, next);
    }
}