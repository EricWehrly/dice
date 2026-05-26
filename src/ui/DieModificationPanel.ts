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
} from './DieModificationTypes';
import { getFaceChances, getPreviewChances } from '../game/DiceProbability';
import { ModifiedDie } from '../game/ModifiedDie';

export class DieModificationPanel {
    private readonly root: HTMLElement | null;
    private readonly canvasRenderer = new DieModificationCanvasRenderer();
    private readonly dice: ModifiedDie[];
    private selectedDieId: string;
    private draftFaceMods: AvailableModValue[] = [];
    private draftCoreMod: AvailableCoreModValue = 'none';

    constructor(dice?: ModifiedDie[]) {
        this.root = document.getElementById('die-mod-panel');
        this.dice = dice ?? [
            new ModifiedDie({ id: 'die-a', label: 'Copper d6', faceCount: 6 }),
            new ModifiedDie({ id: 'die-b', label: 'Silver d6', faceCount: 6, mods: [{ faceIndex: 0, grams: 1 }] }),
            new ModifiedDie({ id: 'die-c', label: 'Bronze d8', faceCount: 8, mods: [{ faceIndex: 3, grams: 0.5 }] }),
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
            draftCoreMod: this.draftCoreMod,
            preview,
            deltas,
            current,
            faceCount: die.faceCount,
            centerPosition,
            hasDraftChanges,
            hasActualDeltas,
            installedModCount: die.mods.length + die.coreMods.length,
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

                die.addWeightMod(index, mod.grams);
            }

            if (this.draftCoreMod !== 'none') {
                die.addCoreMod(this.draftCoreMod);
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

        const coreSelect = this.root.querySelector<HTMLSelectElement>('#die-mod-core-select');
        coreSelect?.addEventListener('change', () => {
            this.draftCoreMod = (coreSelect.value as AvailableCoreModValue) ?? 'none';
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
        if (this.draftCoreMod !== 'none') {
            return true;
        }

        return this.draftFaceMods.some((mod) => mod !== 'none');
    }

    private resetDraftForSelectedDie(): void {
        const die = this.getSelectedDie();
        this.draftFaceMods = Array.from({ length: die.faceCount }, () => 'none');
        this.draftCoreMod = 'none';
    }

    private getSelectedDie(): ModifiedDie {
        return this.dice.find((die) => die.id === this.selectedDieId) ?? this.dice[0];
    }

}

