/**
 * DieModificationPanel Templates
 * 
 * HTML template functions for the die modification UI.
 * Separated from component logic for reusability and testing.
 */

import {
    type AvailableModValue,
    type AvailableCoreModValue,
    type AvailableMaterialValue,
    type AvailableStyleValue,
    AVAILABLE_MODS,
    AVAILABLE_CORE_MODS,
    AVAILABLE_MATERIALS,
    AVAILABLE_STYLES,
} from './DieModificationTypes';

export interface DieModPanelData {
    dice: Array<{ id: string; name: string; faceCount: number }>;
    selectedDieId: string;
    selectedFaceIndex: number; // -1 = core, 0+ = face index
    faceCount: number;
    draftFaceMods: AvailableModValue[];
    draftCoreMod: AvailableCoreModValue;
    draftCoreMaterial: AvailableMaterialValue;
    draftFaceStyles: AvailableStyleValue[];
    preview: number[];
    deltas: number[];
    current: number[];
    hasDraftChanges: boolean;
    hasActualDeltas: boolean;
    selectedCoreMod: AvailableCoreModValue | null;
    selectedTargetFaceIndex: number | null;
    showTargetFaceSelector: boolean;
    targetFaceAnimation: 'none' | 'enter' | 'leave';
    canInstall: boolean;
    actionLabel: 'Install' | 'Uninstall';
}

export function renderDieModPanel(data: DieModPanelData): string {
    const modSelected = data.selectedCoreMod !== null && data.selectedCoreMod !== 'none';
    const canInstall = data.canInstall;

    return `
        <div class="die-mod-shell">
            ${renderDieList(data)}

            <!-- Viewport: keep both mounted and cross-fade -->
            <div class="die-mod-viewport">
                <div class="die-mod-viewport-layer die-mod-viewport-layer--iso ${modSelected ? 'is-fading-out' : 'is-fading-in'}">
                    <div class="die-mod-isometric-container">
                        <canvas id="die-isometric-canvas"></canvas>
                    </div>
                </div>
                <div class="die-mod-viewport-layer die-mod-viewport-layer--faces ${modSelected ? 'is-fading-in' : 'is-fading-out'}">
                    <div class="die-mod-face-carousel" data-carousel-mode="auto">
                        <div class="die-mod-canvas-wrap">
                            <canvas id="die-mod-canvas"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Core mod selector -->
            <label class="die-mod-setting-field">
                <span class="die-mod-setting-label">mod</span>
                <select class="die-mod-setting-select die-mod-core-mod-selector" data-scope="core">
                    ${AVAILABLE_CORE_MODS.map(
                        (mod) =>
                            `<option value="${mod.value}" ${mod.value === (data.selectedCoreMod ?? 'none') ? 'selected' : ''}>${mod.label}</option>`
                    ).join('')}
                    <!-- FUTURE: <option value="brain" disabled>Brain (coming soon)</option> -->
                </select>
            </label>

            <!-- Sub-properties container: fixed height, overflow hidden, slides child in -->
            <div class="die-mod-sub-props">
                <label class="die-mod-setting-field die-mod-sub-field${data.showTargetFaceSelector ? ' is-visible' : ''}${data.targetFaceAnimation === 'enter' ? ' is-entering' : ''}${data.targetFaceAnimation === 'leave' ? ' is-leaving' : ''}">
                    <span class="die-mod-setting-label">target face</span>
                    <select class="die-mod-setting-select die-mod-target-face-selector" ${modSelected ? '' : 'disabled'}>
                        <option value="">-- select face --</option>
                        ${Array.from({ length: data.faceCount }, (_, i) =>
                            `<option value="${i}" ${i === data.selectedTargetFaceIndex ? 'selected' : ''}>Face ${i + 1}</option>`
                        ).join('')}
                    </select>
                </label>
            </div>

            <!-- Style selector -->
            <label class="die-mod-setting-field">
                <span class="die-mod-setting-label">style</span>
                <select class="die-mod-setting-select die-mod-style-selector">
                    ${AVAILABLE_STYLES.map(
                        (style) =>
                            `<option value="${style.value}" ${style.value === data.draftFaceStyles[0] ? 'selected' : ''}>${style.label}</option>`
                    ).join('')}
                </select>
            </label>

            <!-- Install button — always present at bottom, enabled only when mod + face both selected -->
            <div class="die-mod-actions">
                <button class="die-mod-install-btn" type="button" ${canInstall ? '' : 'disabled'}>
                    ${data.actionLabel}
                </button>
            </div>
        </div>
    `;
}

function renderDieList(data: DieModPanelData): string {
    return `
        <div class="die-mod-list">
            ${data.dice
                .map(
                    (item) =>
                        `<button class="die-mod-chip ${item.id === data.selectedDieId ? 'is-selected' : ''}" data-die-id="${item.id}" type="button">
                            ${item.name}
                        </button>`
                )
                .join('')}
        </div>
    `;
}


