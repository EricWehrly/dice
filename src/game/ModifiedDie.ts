// NOTE: ModifiedDie implements DieEquipped inline (not via mixin) because it uses 'new' construction.
// Migrate to DieEquippedMixin via factory pattern when M8.1 EntityBuilder migration lands.
// See engine/docs/EQUIPMENT_GENERALIZATION_ROADMAP.md and docs/features/TB-08-die-mixin-equipped-refactor.md

import { Die, type DieOptions } from './Die';
import { FACE_STAT_KEYS, type DieStatKey, type FaceStatKey } from './DieStatKeys';
import Events from '../../engine/js/events';
import { TrickEvents } from './contracts/TrickContracts';
import type { DieEquipment } from './DieEquipmentTypes';
import { DieSlotType } from './DieEquipmentTypes';
import { DieWeightMod } from './mods/DieWeightMod';

export { DieWeightMod } from './mods/DieWeightMod';

export type DieStats = Record<string, number>;

export interface ModifiedDieOptions extends DieOptions {
    stats?: DieStats;
    faceStats?: DieStats[];
    mod?: { id?: string; faceIndex: number; grams: number } | null;
}

type SlotCollection = Partial<Record<DieSlotType, DieEquipment>>;

export class ModifiedDie extends Die {
    readonly stats: DieStats;
    private readonly faceStats: DieStats[];
    private _slots: SlotCollection = {};

    // Backward-compat getter: returns the installed weight mod, or null.
    get mod(): DieWeightMod | null {
        const equipped = this._slots[DieSlotType.MOD];
        return equipped instanceof DieWeightMod ? equipped : null;
    }

    // DieEquipped interface — inline implementation pending mixin migration
    getEquipped(slotType: DieSlotType): DieEquipment | null {
        return this._slots[slotType] ?? null;
    }

    hasEquipped(slotType: DieSlotType): boolean {
        return this._slots[slotType] !== undefined;
    }

    install(item: DieEquipment): void {
        if (item instanceof DieWeightMod) {
            this._applyWeightMod(item);
        } else {
            this._slots[item.type] = item;
        }
    }

    uninstall(slotType: DieSlotType): void {
        if (slotType === DieSlotType.MOD) {
            this._clearWeightMod(true);
        } else {
            delete this._slots[slotType];
        }
    }

    constructor({ stats = {}, faceStats = [], mod = null, ...dieOptions }: ModifiedDieOptions = {}) {
        super(dieOptions);
        this.stats = { ...stats };
        this.faceStats = Array.from({ length: this.faceCount }, (_, index) => ({ ...(faceStats[index] ?? {}) }));

        if (mod && this._isValidInitialMod(mod)) {
            this._applyWeightMod(new DieWeightMod(mod), false);
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

        this.install(new DieWeightMod({
            id: id ?? `weight-${grams.toFixed(1)}g`,
            faceIndex,
            grams,
        }));
    }

    addCoreMod(id: string): void {
        // Core mods are represented by the single `mod` slot in the new model.
        void id;
    }

    installMod(modId: string, targetFaceIndex: number): boolean {
        const grams = this._resolveModGrams(modId);
        if (grams === null) {
            return false;
        }
        if (!Number.isInteger(targetFaceIndex) || targetFaceIndex < 0 || targetFaceIndex >= this.faceCount) {
            return false;
        }

        this.install(new DieWeightMod({ id: modId, faceIndex: targetFaceIndex, grams }));
        return true;
    }

    uninstallMod(modId?: string): boolean {
        if (!this.mod) {
            return false;
        }

        void modId;

        this.uninstall(DieSlotType.MOD);
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
        return this.mod?.id ?? null;
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

    private _clearWeightMod(emitEvent: boolean): void {
        const current = this.mod;
        if (!current) {
            return;
        }

        this.addFaceStat(current.faceIndex, FACE_STAT_KEYS.WEIGHT, -current.grams);
        delete this._slots[DieSlotType.MOD];
        if (emitEvent) {
            Events.RaiseEvent(TrickEvents.BAG_CHANGED, null);
        }
    }

    private _applyWeightMod(mod: DieWeightMod, emitEvent = true): void {
        const current = this.mod;
        if (current) {
            this.addFaceStat(current.faceIndex, FACE_STAT_KEYS.WEIGHT, -current.grams);
        }

        this._slots[DieSlotType.MOD] = mod;
        this.addFaceStat(mod.faceIndex, FACE_STAT_KEYS.WEIGHT, mod.grams);
        if (emitEvent) {
            Events.RaiseEvent(TrickEvents.BAG_CHANGED, null);
        }
    }

    private _resolveModGrams(modId: string): number | null {
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

    private _isValidInitialMod(mod: { faceIndex: number; grams: number } | null | undefined): mod is { faceIndex: number; grams: number } {
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