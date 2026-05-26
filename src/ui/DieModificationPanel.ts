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
    type AvailableBrainModValue,
} from './DieModificationTypes';
import { getFaceChances, getPreviewChances } from '../game/DiceProbability';

type DummyWeightMod = {
    faceIndex: number;
    grams: number;
};

type DummyCenterMod = {
    id: string;
};

type DummyDieModel = {
    id: string;
    label: string;
    faceCount: number;
    mods: DummyWeightMod[];
    centerMods: DummyCenterMod[];
};

export class DieModificationPanel {
    private readonly root: HTMLElement | null;
    private readonly canvasRenderer = new DieModificationCanvasRenderer();
    private readonly dice: DummyDieModel[];
    private selectedDieId: string;
    private draftFaceMods: AvailableModValue[] = [];
    private draftCenterMod: AvailableBrainModValue = 'none';

    constructor() {
        this.root = document.getElementById('die-mod-panel');
        this.dice = [
            { id: 'die-a', label: 'Copper d6', faceCount: 6, mods: [], centerMods: [] },
            { id: 'die-b', label: 'Silver d6', faceCount: 6, mods: [{ faceIndex: 0, grams: 1 }], centerMods: [] },
            { id: 'die-c', label: 'Bronze d8', faceCount: 8, mods: [{ faceIndex: 3, grams: 0.5 }], centerMods: [] },
        ];
        this.selectedDieId = this.dice[0].id;
        this.resetDraftForSelectedDie();
    }

    render(): void {
        if (!this.root) {
            return;
        }

        const die = this.getSelectedDie();
        this.ensureDraftLength(die.faceCount);
        const current = getFaceChances(die);
        const preview = getPreviewChances(die, this.draftFaceMods);
        const deltas = preview.map((value, index) => value - current[index]);
        const hasDraftChanges = this.hasDraftChanges();
        const hasActualDeltas = deltas.some((delta) => Math.abs(delta) > 0.01);
        const centerPosition = Math.floor(die.faceCount / 2);

        this.root.style.setProperty('--die-mod-face-count', String(die.faceCount + 1));
        this.root.style.setProperty('--die-mod-center-position', String(centerPosition));

        const templateData: DieModPanelData = {
            dice: this.dice,
            selectedDieId: this.selectedDieId,
            draftFaceMods: this.draftFaceMods,
            draftCenterMod: this.draftCenterMod,
            preview,
            deltas,
            current,
            faceCount: die.faceCount,
            centerPosition,
            hasDraftChanges,
            hasActualDeltas,
            installedModCount: die.mods.length + die.centerMods.length,
        };

        this.root.innerHTML = renderDieModPanel(templateData);

        this.canvasRenderer.render({
            root: this.root,
            faceCount: die.faceCount,
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
                this.resetDraftForSelectedDie();
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

                die.mods.push({ faceIndex: index, grams: mod.grams });
            }

            if (this.draftCenterMod !== 'none') {
                die.centerMods.push({ id: this.draftCenterMod });
            }

            this.resetDraftForSelectedDie();
            this.render();
        });

        this.root.querySelectorAll<HTMLSelectElement>('.die-mod-select[data-face-index]').forEach((select) => {
            select.addEventListener('change', () => {
                const faceIndex = Number(select.dataset.faceIndex ?? '-1');
                if (Number.isNaN(faceIndex) || faceIndex < 0) {
                    return;
                }

                this.draftFaceMods[faceIndex] = (select.value as AvailableModValue) ?? 'none';
                this.render();
            });
        });

        const centerSelect = this.root.querySelector<HTMLSelectElement>('#die-mod-center-select');
        centerSelect?.addEventListener('change', () => {
            this.draftCenterMod = (centerSelect.value as AvailableBrainModValue) ?? 'none';
            this.render();
        });
    }

    private ensureDraftLength(faceCount: number): void {
        if (this.draftFaceMods.length === faceCount) {
            return;
        }

        this.draftFaceMods = Array.from({ length: faceCount }, (_, index) => this.draftFaceMods[index] ?? 'none');
    }

    private hasDraftChanges(): boolean {
        if (this.draftCenterMod !== 'none') {
            return true;
        }

        return this.draftFaceMods.some((mod) => mod !== 'none');
    }

    private resetDraftForSelectedDie(): void {
        const die = this.getSelectedDie();
        this.draftFaceMods = Array.from({ length: die.faceCount }, () => 'none');
        this.draftCenterMod = 'none';
    }

    private getSelectedDie(): DummyDieModel {
        return this.dice.find((die) => die.id === this.selectedDieId) ?? this.dice[0];
    }

}

