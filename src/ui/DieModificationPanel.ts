/**
 * DieModificationPanel
 * 
 * UI for inspecting a die, selecting and previewing modifications,
 * and installing them to the die.
 * 
 * Phase 1: Two-mode UI
 * - Collapsed: Browse die + select core mod + select style
 * - Expanded: Install selected mod to specific face, with target face selector
 */

import { renderDieModPanel, type DieModPanelData } from './DieModificationPanelTemplate';
import { DieIsometricRenderer } from '../rendering/2d/DieIsometricRenderer';
import { DieModificationCanvasRenderer } from './DieModificationCanvasRenderer';
import {
    AVAILABLE_MODS,
    type AvailableModValue,
    type AvailableCoreModValue,
    type AvailableMaterialValue,
    type AvailableStyleValue,
} from './DieModificationTypes';
import { getPreviewChances } from '../game/DiceProbability';
import { Bag } from '../game/Bag';
import { DieEquipmentInstallOptions, DieEquipped, DieSlotType } from '../game/DieEquippedMixin';
import { Die } from '../game/Die';
import { DieWeightMod } from '../game/mods/DieWeightMod';

type PendingModAction = 'install' | 'uninstall' | 'none';

export class DieModificationPanel {
    private readonly root: HTMLElement | null;
    private readonly isometricRenderer = new DieIsometricRenderer();
    private readonly canvasRenderer = new DieModificationCanvasRenderer();
    private readonly bag: Bag;
    
    // Die/face selection (persistent across modes)
    private selectedDieId: string;
    private selectedFaceIndex = -1; // -1 = core, 0+ = face index
    
    // Legacy draft state (for face mods in future phases)
    private draftFaceMods: AvailableModValue[] = [];
    private draftCoreMod: AvailableCoreModValue = 'none';
    private draftCoreMaterial: AvailableMaterialValue = 'bone';
    private draftFaceStyles: AvailableStyleValue[] = [];
    
    // Core mod install state
    private selectedCoreMod: AvailableCoreModValue | null = null;
    private selectedTargetFaceIndex: number | null = null;
    private wasModSelected = false;
    private isTargetFaceLeaving = false;
    private targetFaceLeaveTimeoutId: number | null = null;

    constructor(bag: Bag) {
        this.root = document.getElementById('die-mod-panel');
        this.bag = bag;
        this.selectedDieId = this.bag.getActiveDice()[0].id;
        this.resetDraftForSelectedDie();
    }

    render(): void {
        if (!this.root) {
            return;
        }

        const die = this.getSelectedDie();
        this.ensureDraftLength(die.faceCount);
        this.ensureFaceIndex(die.faceCount);
        const previewFaceMods = this.getPreviewFaceMods();
        const modSelected = this.selectedCoreMod !== null && this.selectedCoreMod !== 'none';
        const targetFaceAnimation = !this.wasModSelected && modSelected
            ? 'enter'
            : this.wasModSelected && !modSelected
                ? 'leave'
                : 'none';

        if (targetFaceAnimation === 'leave') {
            this.isTargetFaceLeaving = true;
            if (this.targetFaceLeaveTimeoutId !== null) {
                window.clearTimeout(this.targetFaceLeaveTimeoutId);
            }
            this.targetFaceLeaveTimeoutId = window.setTimeout(() => {
                this.isTargetFaceLeaving = false;
                this.targetFaceLeaveTimeoutId = null;
                this.render();
            }, 180);
        } else if (targetFaceAnimation === 'enter') {
            if (this.targetFaceLeaveTimeoutId !== null) {
                window.clearTimeout(this.targetFaceLeaveTimeoutId);
                this.targetFaceLeaveTimeoutId = null;
            }
            this.isTargetFaceLeaving = false;
        }

        const showTargetFaceSelector = modSelected || this.isTargetFaceLeaving;
        const pendingAction = this.getPendingAction(die);
        const canInstall = pendingAction !== 'none';
        const actionLabel = pendingAction === 'uninstall' ? 'Uninstall' : 'Install';
        const current = getPreviewChances(die, this.draftFaceMods);
        const preview = getPreviewChances(die, previewFaceMods);
        const deltas = preview.map((value, index) => value - current[index]);
        const hasDraftChanges = this.hasDraftChanges();
        const hasActualDeltas = deltas.some((delta) => Math.abs(delta) > 0.01);

        const templateData: DieModPanelData = {
            dice: this.bag.getActiveDice(),
            selectedDieId: this.selectedDieId,
            selectedFaceIndex: this.selectedFaceIndex,
            faceCount: die.faceCount,
            draftFaceMods: this.draftFaceMods,
            draftCoreMod: this.draftCoreMod,
            draftCoreMaterial: this.draftCoreMaterial,
            draftFaceStyles: this.draftFaceStyles,
            preview,
            deltas,
            current,
            hasDraftChanges,
            hasActualDeltas,
            selectedCoreMod: this.selectedCoreMod,
            selectedTargetFaceIndex: this.selectedTargetFaceIndex,
            showTargetFaceSelector,
            targetFaceAnimation,
            canInstall,
            actionLabel,
        };

        this.root.innerHTML = renderDieModPanel(templateData);

        const installedMod = die.getEquipped(DieSlotType.MOD);
        const installedCoreModId = installedMod?.id ?? null;
        const installedCoreModFaceIndex = installedMod instanceof DieWeightMod
            ? installedMod.faceIndex
            : null;

        // Keep both viewports rendered so CSS can cross-fade between them.
        this.isometricRenderer.render({
            root: this.root,
            faceCount: die.faceCount,
            currentCoreMod: this.selectedCoreMod ?? installedCoreModId,
            coreModInstalledOnFace: installedCoreModFaceIndex,
            style: (this.draftFaceStyles[0] ?? 'plain') as 'plain' | 'etched' | 'polished' | 'hammered',
        });

        this.canvasRenderer.render({
            root: this.root,
            faceCount: die.faceCount,
            selectedFaceIndex: this.selectedTargetFaceIndex ?? 0,
            preview,
            deltas,
        });

        this.wasModSelected = modSelected;

        this.wireHandlers();
    }

    private wireHandlers(): void {
        if (!this.root) {
            return;
        }

        // Die selector chips
        this.root.querySelectorAll<HTMLButtonElement>('.die-mod-chip').forEach((button) => {
            button.addEventListener('click', () => {
                const dieId = button.dataset.dieId;
                if (!dieId) {
                    return;
                }
                this.selectedDieId = dieId;
                this.selectedFaceIndex = 0;
                this.resetDraftForSelectedDie();
                this.selectedCoreMod = null;
                this.selectedTargetFaceIndex = null;
                this.render();
            });
        });

        // Core mod selector
        const coreModSelector = this.root.querySelector<HTMLSelectElement>('.die-mod-core-mod-selector');
        coreModSelector?.addEventListener('change', (event) => {
            const target = event.target as HTMLSelectElement;
            const modValue = target.value as AvailableCoreModValue;

            const wasModVisible = this.selectedCoreMod !== null && this.selectedCoreMod !== 'none';
            const nextCoreMod = modValue;
            const willModBeVisible = nextCoreMod !== 'none';

            this.selectedCoreMod = nextCoreMod;

            // Preserve selected face across weight amount changes.
            // Only reset when the face selector becomes hidden.
            if (wasModVisible && !willModBeVisible) {
                this.selectedTargetFaceIndex = null;
            }

            this.render();
        });

        // Collapsed mode: Style selector
        const styleSelector = this.root.querySelector<HTMLSelectElement>('.die-mod-style-selector');
        styleSelector?.addEventListener('change', (event) => {
            const target = event.target as HTMLSelectElement;
            this.draftFaceStyles[0] = (target.value as AvailableStyleValue) ?? 'plain';
            this.render();
        });

        // Target face selector (shown only when a mod is selected)
        const targetSelector = this.root.querySelector<HTMLSelectElement>('.die-mod-target-face-selector');
        targetSelector?.addEventListener('change', (event) => {
            const target = event.target as HTMLSelectElement;
            const value = target.value;
            this.selectedTargetFaceIndex = value ? parseInt(value, 10) : null;
            this.render();
        });

        // Install button
        const installBtn = this.root.querySelector<HTMLButtonElement>('.die-mod-install-btn');
        installBtn?.addEventListener('click', () => {
            this.handleInstall();
        });
    }

    /**
     * Handle Install button click: apply mod to die and collapse.
     * Calls die.installMod(modId, targetFaceIndex) API.
     */
    private handleInstall(): void {
        const die = this.getSelectedDie();
        const pendingAction = this.getPendingAction(die);
        if (pendingAction === 'none') {
            console.warn('DieModificationPanel: No mod selected for install');
            return;
        }

        if (pendingAction === 'uninstall') {
            const didUninstall = die.uninstall(DieSlotType.MOD);
            if (didUninstall === false) {
                return;
            }

            this.resetDraftForSelectedDie();
            this.render();
            return;
        }

        const selectedCoreMod = this.selectedCoreMod;
        const selectedTargetFaceIndex = this.selectedTargetFaceIndex;
        if (!selectedCoreMod || selectedTargetFaceIndex === null) {
            return;
        }

        const selectedModDef = AVAILABLE_MODS.find((mod) => mod.value === selectedCoreMod);
        if (!selectedModDef || selectedModDef.grams <= 0) {
            return;
        }

        const installOptions: DieEquipmentInstallOptions = { faceIndex: selectedTargetFaceIndex };
        const didInstall = die.install(
            new DieWeightMod({
                id: selectedCoreMod,
                faceIndex: selectedTargetFaceIndex,
                grams: selectedModDef.grams,
            }),
            installOptions,
        );
        if (didInstall === false) {
            return;
        }

        this.resetDraftForSelectedDie();

        // Keep selected mod + face after install.
        // Button will disable because there is no longer a pending change.
        this.draftCoreMod = selectedCoreMod;
        this.render();
    }

    private getPendingAction(die: Die & DieEquipped): PendingModAction {
        const selectedCoreMod = this.selectedCoreMod;
        const installedMod = die.getEquipped(DieSlotType.MOD);

        if (selectedCoreMod === null) {
            return 'none';
        }

        if (selectedCoreMod === 'none') {
            return installedMod ? 'uninstall' : 'none';
        }

        if (this.selectedTargetFaceIndex === null) {
            return 'none';
        }

        if (!installedMod) {
            return 'install';
        }

        if (installedMod.id !== selectedCoreMod) {
            return 'install';
        }

        if (installedMod instanceof DieWeightMod && installedMod.faceIndex !== this.selectedTargetFaceIndex) {
            return 'install';
        }

        if (!(installedMod instanceof DieWeightMod) && this.selectedTargetFaceIndex !== null) {
            return 'install';
        }

        return 'none';
    }

    private ensureDraftLength(faceCount: number): void {
        if (this.draftFaceMods.length === faceCount) {
            return;
        }

        this.draftFaceMods = Array.from({ length: faceCount }, (_, index) => this.draftFaceMods[index] ?? 'none');
    }

    private ensureFaceIndex(faceCount: number): void {
        this.selectedFaceIndex = this.wrapFaceIndex(this.selectedFaceIndex, faceCount);
    }

    private wrapFaceIndex(index: number, faceCount: number): number {
        if (faceCount <= 0) {
            return -1;
        }
        // Total positions: -1 (core) through faceCount-1 (last face)
        // Total count: faceCount + 1
        const totalPositions = faceCount + 1;
        const position = ((index + 1) % totalPositions + totalPositions) % totalPositions;
        return position - 1;
    }

    private getPreviewFaceMods(): AvailableModValue[] {
        const previewMods = [...this.draftFaceMods];
        if (!this.selectedCoreMod || this.selectedCoreMod === 'none' || this.selectedTargetFaceIndex === null) {
            return previewMods;
        }

        previewMods[this.selectedTargetFaceIndex] = this.selectedCoreMod as AvailableModValue;
        return previewMods;
    }

    private hasDraftChanges(): boolean {
        if (this.draftCoreMod !== 'none') {
            return true;
        }

        return this.draftFaceMods.some((mod) => mod !== 'none');
    }

    private resetDraftForSelectedDie(): void {
        const die = this.getSelectedDie();
        this.draftFaceMods = this.getDraftFaceModsFromDie(die);
        this.draftFaceStyles = Array.from({ length: die.faceCount }, () => 'plain');
        this.draftCoreMod = 'none';
        this.draftCoreMaterial = 'bone';
    }

    private getDraftFaceModsFromDie(die: Die & DieEquipped): AvailableModValue[] {
        const installedMod = die.getEquipped(DieSlotType.MOD);
        const gramsByFace = Array.from({ length: die.faceCount }, (_, faceIndex) => {
            if (installedMod instanceof DieWeightMod && installedMod.faceIndex === faceIndex) {
                return Math.max(0, installedMod.grams);
            }

            return 0;
        });

        return gramsByFace.map((grams) => this.mapGramsToModValue(grams));
    }

    private mapGramsToModValue(grams: number): AvailableModValue {
        if (grams <= 0) {
            return 'none';
        }

        const weightedMods = AVAILABLE_MODS.filter((mod) => mod.value !== 'none');
        if (weightedMods.length === 0) {
            return 'none';
        }

        const exactMatch = weightedMods.find((mod) => Math.abs(mod.grams - grams) < 1e-6);
        if (exactMatch) {
            return exactMatch.value;
        }

        let nearest = weightedMods[0];
        let nearestDistance = Math.abs(nearest.grams - grams);

        for (const mod of weightedMods.slice(1)) {
            const distance = Math.abs(mod.grams - grams);
            if (distance < nearestDistance) {
                nearest = mod;
                nearestDistance = distance;
            }
        }

        return nearest.value;
    }

    private getSelectedDie(): Die & DieEquipped {
        return this.bag.getActiveDice().find((die) => die.id === this.selectedDieId) ?? this.bag.getActiveDice()[0];
    }
}

