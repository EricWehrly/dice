import { Die, type DieOptions } from './Die';
import { FACE_STAT_KEYS, type DieStatKey, type FaceStatKey } from './DieStatKeys';
import Events from '../../engine/js/events';
import { TrickEvents } from './contracts/TrickContracts';

export type DieStats = Record<string, number>;

export interface DieWeightMod {
    id?: string;
    faceIndex: number;
    grams: number;
}

export interface ModifiedDieOptions extends DieOptions {
    stats?: DieStats;
    faceStats?: DieStats[];
    mod?: DieWeightMod | null;
}

export class ModifiedDie extends Die {
    readonly stats: DieStats;
    mod: DieWeightMod | null;
    private readonly faceStats: DieStats[];

    constructor({ stats = {}, faceStats = [], mod = null, ...dieOptions }: ModifiedDieOptions = {}) {
        super(dieOptions);
        this.stats = { ...stats };
        this.faceStats = Array.from({ length: this.faceCount }, (_, index) => ({ ...(faceStats[index] ?? {}) }));
        this.mod = null;

        if (this.isValidInitialMod(mod)) {
            this.setInstalledMod(mod, false);
        }
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

        this.setInstalledMod({
            id: id ?? `weight-${grams.toFixed(1)}g`,
            faceIndex,
            grams,
        }, true);
    }

    addCoreMod(id: string): void {
        // Core mods are represented by the single `mod` slot in the new model.
        void id;
    }

    installMod(modId: string, targetFaceIndex: number): boolean {
        const grams = this.resolveModGrams(modId);
        if (grams === null) {
            return false;
        }
        if (!Number.isInteger(targetFaceIndex) || targetFaceIndex < 0 || targetFaceIndex >= this.faceCount) {
            return false;
        }

        this.setInstalledMod({
            id: modId,
            faceIndex: targetFaceIndex,
            grams,
        }, true);
        return true;
    }

    uninstallMod(modId?: string): boolean {
        if (!this.mod) {
            return false;
        }

        void modId;

        this.clearInstalledMod(true);
        return true;
    }

    getInstalledModFaceIndex(modId?: string): number | null {
        if (!this.mod) {
            return null;
        }
        if (modId && this.mod.id !== modId) {
            return null;
        }

        return this.mod.faceIndex;
    }

    getInstalledWeightModId(): string | null {
        return this.getInstalledModId();
    }

    getInstalledModId(): string | null {
        return this.mod?.id ?? null;
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

    private clearInstalledMod(emitEvent: boolean): void {
        if (!this.mod) {
            return;
        }

        this.addFaceStat(this.mod.faceIndex, FACE_STAT_KEYS.WEIGHT, -this.mod.grams);
        this.mod = null;
        if (emitEvent) {
            Events.RaiseEvent(TrickEvents.BAG_CHANGED, null);
        }
    }

    private setInstalledMod(mod: DieWeightMod, emitEvent: boolean): void {
        if (this.mod) {
            this.addFaceStat(this.mod.faceIndex, FACE_STAT_KEYS.WEIGHT, -this.mod.grams);
        }

        this.mod = {
            id: mod.id,
            faceIndex: mod.faceIndex,
            grams: mod.grams,
        };
        this.addFaceStat(mod.faceIndex, FACE_STAT_KEYS.WEIGHT, mod.grams);
        if (emitEvent) {
            Events.RaiseEvent(TrickEvents.BAG_CHANGED, null);
        }
    }

    private resolveModGrams(modId: string): number | null {
        if (this.mod?.id === modId) {
            return this.mod.grams;
        }

        const match = /^weight-([0-9]+(?:\.[0-9]+)?)/.exec(modId);
        if (!match) {
            return null;
        }

        const grams = Number(match[1]);
        return Number.isFinite(grams) && grams > 0 ? grams : null;
    }

    private isValidInitialMod(mod: DieWeightMod | null | undefined): mod is DieWeightMod {
        return Boolean(
            mod
            && Number.isInteger(mod.faceIndex)
            && mod.faceIndex >= 0
            && mod.faceIndex < this.faceCount
            && Number.isFinite(mod.grams)
            && mod.grams > 0,
        );
    }
}