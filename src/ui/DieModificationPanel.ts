/**
 * DieModificationPanel
 * 
 * UI for inspecting a die, selecting and previewing modifications,
 * and installing them to the die.
 * 
 * Current: Read-only dummy UI with hard-coded mod options.
 * Future: Wire real Die model and Modification resolver.
 */

import { renderDieModPanel, type DieModPanelData } from './DieModificationPanelTemplate';
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
    private readonly canvasRenderer = new DieModificationCanvasRenderer();
    private readonly dice: ModifiedDie[];
    private selectedDieId: string;
    private selectedFaceIndex = -1; // -1 = core, 0+ = face index
    private draftFaceMods: AvailableModValue[] = [];
    private draftCoreMod: AvailableCoreModValue = 'none';
    private draftCoreMaterial: AvailableMaterialValue = 'bone';
    private draftFaceStyles: AvailableStyleValue[] = [];

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
        const current = getFaceChances(die);
        const preview = getPreviewChances(die, this.draftFaceMods);
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
        };

        this.root.innerHTML = renderDieModPanel(templateData);

        this.canvasRenderer.render({
            root: this.root,
            faceCount: die.faceCount,
            selectedFaceIndex: this.selectedFaceIndex,
            preview,
            deltas,
        });
        this.wireHandlers();
    }

    private wireHandlers(): void {
        if (!this.root) {
            return;
        }

        this.root.querySelectorAll<HTMLButtonElement>('.die-mod-chip').forEach((button) => {
            button.addEventListener('click', () => {
                const dieId = button.dataset.dieId;
                if (!dieId) {
                    return;
                }
                this.selectedDieId = dieId;
                this.selectedFaceIndex = 0;
                this.resetDraftForSelectedDie();
                this.render();
            });
        });

        this.root.querySelectorAll<HTMLButtonElement>('.die-mod-face-nav-btn').forEach((button) => {
            button.addEventListener('click', () => {
                const die = this.getSelectedDie();
                const step = Number(button.dataset.faceStep ?? '0');
                if (!Number.isFinite(step) || step === 0) {
                    return;
                }
                this.selectedFaceIndex = this.wrapFaceIndex(this.selectedFaceIndex + step, die.faceCount);
                this.render();
            });
        });

        const installButton = this.root.querySelector<HTMLButtonElement>('#die-mod-install-btn');
        installButton?.addEventListener('click', () => {
            const die = this.getSelectedDie();
            for (let index = 0; index < this.draftFaceMods.length; index += 1) {
                const modValue = this.draftFaceMods[index];
                const mod = AVAILABLE_MODS.find((item) => item.value === modValue);
                if (!mod || mod.value === 'none') {
                    continue;
                }

                die.addWeightMod(index, mod.grams);
            }

            if (this.draftCoreMod !== 'none') {
                die.addCoreMod(this.draftCoreMod);
            }

            this.resetDraftForSelectedDie();
            this.render();
        });

        this.root.querySelectorAll<HTMLSelectElement>('.die-mod-setting-select').forEach((select) => {
            select.addEventListener('change', () => {
                const scope = select.dataset.scope;
                const field = select.dataset.field;

                if (scope === 'core' && field === 'mod') {
                    this.draftCoreMod = (select.value as AvailableCoreModValue) ?? 'none';
                } else if (scope === 'core' && field === 'material') {
                    this.draftCoreMaterial = (select.value as AvailableMaterialValue) ?? 'bone';
                } else if (scope === 'face' && field === 'mod') {
                    this.draftFaceMods[this.selectedFaceIndex] = (select.value as AvailableModValue) ?? 'none';
                } else if (scope === 'face' && field === 'style') {
                    this.draftFaceStyles[this.selectedFaceIndex] = (select.value as AvailableStyleValue) ?? 'plain';
                }

                this.render();
            });
        });
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

