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
import { getFaceChances, getPreviewChances } from '../game/DiceProbability';
import { ModifiedDie } from '../game/ModifiedDie';

export class DieModificationPanel {
    private readonly root: HTMLElement | null;
    private readonly isometricRenderer = new DieIsometricRenderer();
    private readonly canvasRenderer = new DieModificationCanvasRenderer();
    private readonly dice: ModifiedDie[];
    
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

    constructor(dice: ModifiedDie[]) {
        this.root = document.getElementById('die-mod-panel');
        this.dice = dice;
        this.selectedDieId = this.dice[0].id;
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
        const current = getFaceChances(die);
        const preview = getPreviewChances(die, previewFaceMods);
        const deltas = preview.map((value, index) => value - current[index]);
        const hasDraftChanges = this.hasDraftChanges();
        const hasActualDeltas = deltas.some((delta) => Math.abs(delta) > 0.01);

        const templateData: DieModPanelData = {
            dice: this.dice,
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
        };

        this.root.innerHTML = renderDieModPanel(templateData);

        // Keep both viewports rendered so CSS can cross-fade between them.
        this.isometricRenderer.render({
            root: this.root,
            faceCount: die.faceCount,
            currentCoreMod: this.selectedCoreMod,
            coreModInstalledOnFace: null, // TODO: Get from die.mods when available
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
            const nextCoreMod = modValue !== 'none' ? modValue : null;
            const willModBeVisible = nextCoreMod !== null;

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
        if (!this.selectedCoreMod || this.selectedCoreMod === 'none') {
            console.warn('DieModificationPanel: No mod selected for install');
            return;
        }

        const die = this.getSelectedDie();
        
        // TODO: Wire to real die.installMod(modId, targetFaceIndex) API
        // For now, store as draftCoreMod placeholder
        this.draftCoreMod = this.selectedCoreMod;
        
        // Emit BAG_UPDATED event (TODO: implement when game state API available)
        // window.dispatchEvent(new CustomEvent('BAG_UPDATED', { detail: { dieId: die.id } }));

        // Reset install state after installing
        this.selectedCoreMod = null;
        this.selectedTargetFaceIndex = null;
        this.render();
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
        this.draftFaceMods = Array.from({ length: die.faceCount }, () => 'none');
        this.draftFaceStyles = Array.from({ length: die.faceCount }, () => 'plain');
        this.draftCoreMod = 'none';
        this.draftCoreMaterial = 'bone';
    }

    private getSelectedDie(): ModifiedDie {
        return this.dice.find((die) => die.id === this.selectedDieId) ?? this.dice[0];
    }
}

