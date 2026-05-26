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

const BASE_FACE_WEIGHT = 1;
const WEIGHT_FACTOR = 0.12;

const AVAILABLE_MODS = [
    { value: 'none', label: '---', grams: 0 },
    { value: 'weight-1.0', label: 'Weight 1.0g', grams: 1.0 },
    { value: 'weight-1.5', label: 'Weight 1.5g', grams: 1.5 },
    { value: 'weight-2.0', label: 'Weight 2.0g', grams: 2.0 },
    { value: 'weight-2.5', label: 'Weight 2.5g', grams: 2.5 },
] as const;

const AVAILABLE_BRAIN_MODS = [
    { value: 'none', label: '---', grams: 0 },
    { value: 'brain', label: 'Brain', grams: 0 },
] as const;

type AvailableModValue = typeof AVAILABLE_MODS[number]['value'];
type AvailableBrainModValue = typeof AVAILABLE_BRAIN_MODS[number]['value'];

export class TB05PrototypePanel {
    private readonly root: HTMLElement | null;
    private readonly dice: DummyDieModel[];
    private selectedDieId: string;
    private draftFaceMods: AvailableModValue[] = [];
    private draftCenterMod: AvailableBrainModValue = 'none';

    constructor() {
        this.root = document.getElementById('tb05-prototype');
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
        const current = this.getFaceChances(die);
        const preview = this.getPreviewChances(die);
        const deltas = preview.map((value, index) => value - current[index]);
        const hasDraftChanges = this.hasDraftChanges();
        const hasActualDeltas = deltas.some((delta) => Math.abs(delta) > 0.01);
        const centerPosition = Math.floor(die.faceCount / 2);

        this.root.style.setProperty('--tb05-face-count', String(die.faceCount + 1));
        this.root.style.setProperty('--tb05-center-position', String(centerPosition));

        this.root.innerHTML = `
            <h3>TB-05 Prototype: Die Inspector</h3>
            <p class="tb05-caption">Dummy data sandbox for selection, preview, and install flow.</p>

            <div class="tb05-die-list">
                ${this.dice.map((item) => `
                    <button class="tb05-die-chip ${item.id === die.id ? 'is-selected' : ''}" data-die-id="${item.id}" type="button">
                        ${item.label}
                    </button>
                `).join('')}
            </div>

            <div class="tb05-canvas-wrap">
                <canvas id="tb05-face-canvas"></canvas>
            </div>

            <div class="tb05-mod-row">
                <div class="tb05-mod-picker tb05-mod-label">mod</div>

                <div class="tb05-face-targets">
                    <div class="tb05-face-target-grid">
                        ${Array.from({ length: die.faceCount }, (_, index) => {
                            if (index === centerPosition) {
                                return `
                                    <label class="tb05-face-target tb05-center-slot" title="Die core">
                                        <span class="tb05-slot-label tb05-core-slot-label">core</span>
                                        <select id="tb05-center-mod-select" class="tb05-face-mod-select">
                                            ${AVAILABLE_BRAIN_MODS.map((mod) => `
                                                <option value="${mod.value}" ${mod.value === this.draftCenterMod ? 'selected' : ''}>${mod.label}</option>
                                            `).join('')}
                                        </select>
                                    </label>
                                    <label class="tb05-face-target" title="Face ${index + 1}">
                                        <select class="tb05-face-mod-select" data-face-index="${index}">
                                            ${AVAILABLE_MODS.map((mod) => `
                                                <option value="${mod.value}" ${mod.value === this.draftFaceMods[index] ? 'selected' : ''}>${mod.label}</option>
                                            `).join('')}
                                        </select>
                                    </label>
                                `;
                            }
                            return `
                                <label class="tb05-face-target" title="Face ${index + 1}">
                                    <select class="tb05-face-mod-select" data-face-index="${index}">
                                        ${AVAILABLE_MODS.map((mod) => `
                                            <option value="${mod.value}" ${mod.value === this.draftFaceMods[index] ? 'selected' : ''}>${mod.label}</option>
                                        `).join('')}
                                    </select>
                                </label>
                            `;
                        }).join('')}
                    </div>
                </div>

                <button id="tb05-install-mod" class="tb05-install-btn" type="button" ${hasDraftChanges ? '' : 'disabled'}>Install</button>
            </div>

            <div class="tb05-values">
                <div class="tb05-value-row">
                    <div class="tb05-row-label">up chance</div>
                    <div class="tb05-value-grid">
                        ${Array.from({ length: die.faceCount + 1 }, (_, displayIndex) => {
                            if (displayIndex === centerPosition) {
                                return '<div class="tb05-value-cell core-gap"></div>';
                            }
                            const faceIndex = displayIndex < centerPosition ? displayIndex : displayIndex - 1;
                            const value = preview[faceIndex] ?? 0;
                            return `<div class="tb05-value-cell">${value.toFixed(1)}%</div>`;
                        }).join('')}
                    </div>
                </div>
                ${hasActualDeltas ? `<div class="tb05-value-row">
                    <div class="tb05-row-label"></div>
                    <div class="tb05-value-grid">
                        ${Array.from({ length: die.faceCount + 1 }, (_, displayIndex) => {
                            if (displayIndex === centerPosition) {
                                return '<div class="tb05-value-cell core-gap"></div>';
                            }
                            const faceIndex = displayIndex < centerPosition ? displayIndex : displayIndex - 1;
                            const delta = deltas[faceIndex] ?? 0;
                            const className = delta > 0 ? 'delta-up' : (delta < 0 ? 'delta-down' : '');
                            const value = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`;
                            return `<div class="tb05-value-cell ${className}">${value}</div>`;
                        }).join('')}
                    </div>
                </div>` : ''}
            </div>

            <p class="tb05-caption">Installed mods on selected die: ${die.mods.length + die.centerMods.length}</p>
        `;

        this.renderFaceCanvas(die, current, preview);
        this.wireHandlers();
    }

    private wireHandlers(): void {
        if (!this.root) {
            return;
        }

        this.root.querySelectorAll<HTMLButtonElement>('.tb05-die-chip').forEach((button) => {
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

        const installButton = this.root.querySelector<HTMLButtonElement>('#tb05-install-mod');
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

        this.root.querySelectorAll<HTMLSelectElement>('.tb05-face-mod-select[data-face-index]').forEach((select) => {
            select.addEventListener('change', () => {
                const faceIndex = Number(select.dataset.faceIndex ?? '-1');
                if (Number.isNaN(faceIndex) || faceIndex < 0) {
                    return;
                }

                this.draftFaceMods[faceIndex] = (select.value as AvailableModValue) ?? 'none';
                this.render();
            });
        });

        const centerSelect = this.root.querySelector<HTMLSelectElement>('#tb05-center-mod-select');
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

    private getModGrams(modValue: AvailableModValue): number {
        const selected = AVAILABLE_MODS.find((item) => item.value === modValue);
        if (!selected) {
            return 0;
        }
        return selected.grams;
    }

    private getSelectedDie(): DummyDieModel {
        return this.dice.find((die) => die.id === this.selectedDieId) ?? this.dice[0];
    }

    private getPreviewChances(die: DummyDieModel): number[] {
        const previewMods: DummyWeightMod[] = [];
        for (let faceIndex = 0; faceIndex < this.draftFaceMods.length; faceIndex += 1) {
            const modValue = this.draftFaceMods[faceIndex];
            const grams = this.getModGrams(modValue);
            if (modValue !== 'none' && grams > 0) {
                previewMods.push({ faceIndex, grams });
            }
        }

        if (previewMods.length === 0) {
            return this.getFaceChances(die);
        }

        return this.getFaceChances(die, previewMods);
    }

    private getFaceChances(die: DummyDieModel, extraMods: DummyWeightMod[] = []): number[] {
        const weights = Array.from({ length: die.faceCount }, () => BASE_FACE_WEIGHT);

        for (const mod of die.mods) {
            if (mod.faceIndex >= 0 && mod.faceIndex < weights.length) {
                weights[mod.faceIndex] = Math.max(0.05, weights[mod.faceIndex] - mod.grams * WEIGHT_FACTOR);
            }
        }

        for (const mod of extraMods) {
            if (mod.faceIndex >= 0 && mod.faceIndex < weights.length) {
                weights[mod.faceIndex] = Math.max(0.05, weights[mod.faceIndex] - mod.grams * WEIGHT_FACTOR);
            }
        }

        const total = weights.reduce((sum, value) => sum + value, 0);
        return weights.map((value) => (value / total) * 100);
    }

    private renderFaceCanvas(die: DummyDieModel, _current: number[], _preview: number[]): void {
        if (!this.root) {
            return;
        }

        const canvas = this.root.querySelector<HTMLCanvasElement>('#tb05-face-canvas');
        if (!canvas) {
            return;
        }

        const dpr = window.devicePixelRatio || 1;
        const padding = 0;
        const columnWidth = 92;
        const tileSize = 44;
        const centerPosition = Math.floor(die.faceCount / 2);
        const width = padding * 2 + (die.faceCount + 1) * columnWidth;
        const height = padding * 2 + tileSize;

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }

        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, width, height);

        const tileBg = this.getThemeColor('--color-die-face-bg', '#f8f8f8');
        const tileBorder = this.getThemeColor('--color-die-face-border', '#999');
        const tileText = this.getThemeColor('--color-die-face-text', '#222');

        context.textAlign = 'center';
        context.textBaseline = 'middle';

        const coreAccent = this.getThemeColor('--color-gold-trim', '#d4af37');
        const coreGlow = this.getThemeColor('--color-gold-trim-soft', '#7f6b2d');

        for (let index = 0; index < die.faceCount; index += 1) {
            const displayIndex = index < centerPosition ? index : index + 1;
            const x = padding + displayIndex * columnWidth;
            const tileX = x + (columnWidth - tileSize) / 2;

            context.fillStyle = tileBg;
            context.strokeStyle = tileBorder;
            context.lineWidth = 2;
            context.fillRect(tileX, padding, tileSize, tileSize);
            context.strokeRect(tileX, padding, tileSize, tileSize);

            context.fillStyle = tileText;
            context.font = '600 20px "Trebuchet MS", sans-serif';
            context.fillText(String(index + 1), tileX + tileSize / 2, padding + tileSize / 2);
        }

        // Draw core slot as a subdued die-like tile (dark fill, not face-white)
        const corePanelBg = this.getThemeColor('--color-counter-bg', '#111');
        const coreX = padding + centerPosition * columnWidth;
        const coreTileX = coreX + (columnWidth - tileSize) / 2;
        context.fillStyle = corePanelBg;
        context.strokeStyle = coreAccent;
        context.lineWidth = 2;
        context.fillRect(coreTileX, padding, tileSize, tileSize);
        context.strokeRect(coreTileX, padding, tileSize, tileSize);

        context.save();
        context.strokeStyle = coreAccent;
        context.shadowColor = coreGlow;
        context.shadowBlur = 6;
        context.globalAlpha = 0.45;
        context.strokeRect(coreTileX, padding, tileSize, tileSize);
        context.restore();

        // Subtle inner ring only — no fill
        const innerSize = tileSize - 16;
        const innerX = coreTileX + (tileSize - innerSize) / 2;
        const innerY = padding + (tileSize - innerSize) / 2;
        context.strokeStyle = coreAccent;
        context.globalAlpha = 0.42;
        context.lineWidth = 1;
        context.strokeRect(innerX, innerY, innerSize, innerSize);
        context.globalAlpha = 1;
    }

    private getThemeColor(variableName: string, fallback: string): string {
        const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
        return value || fallback;
    }
}