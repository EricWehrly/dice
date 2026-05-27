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
    dice: Array<{ id: string; label: string; faceCount: number }>;
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
}

export function renderDieModPanel(data: DieModPanelData): string {
    const isCore = data.selectedFaceIndex === -1;

    return `
        <div class="die-mod-shell">
            ${renderDieList(data)}

            <div class="die-mod-face-carousel" data-carousel-mode="auto">
                <button class="die-mod-face-nav-btn die-mod-face-nav-btn-prev" data-face-step="-1" type="button" aria-label="Previous">&lt;</button>
                <div class="die-mod-canvas-wrap">
                    <canvas id="die-mod-canvas"></canvas>
                </div>
                <button class="die-mod-face-nav-btn die-mod-face-nav-btn-next" data-face-step="1" type="button" aria-label="Next">&gt;</button>
            </div>

            ${isCore ? renderCoreSettings(data) : renderFaceSettings(data)}

            <button id="die-mod-install-btn" class="die-mod-install-btn" type="button" ${data.hasDraftChanges ? '' : 'disabled'}>Install</button>
        </div>
    `;
}

function renderFaceSettings(data: DieModPanelData): string {
    return `
        <div class="die-mod-settings-block">
            <label class="die-mod-setting-field">
                <span class="die-mod-setting-label">mod</span>
                <select class="die-mod-setting-select" data-scope="face" data-field="mod">
                    ${AVAILABLE_MODS.map(
                        (mod) =>
                            `<option value="${mod.value}" ${mod.value === data.draftFaceMods[data.selectedFaceIndex] ? 'selected' : ''}>${mod.label}</option>`
                    ).join('')}
                </select>
            </label>
            <label class="die-mod-setting-field">
                <span class="die-mod-setting-label">style</span>
                <select class="die-mod-setting-select" data-scope="face" data-field="style" disabled>
                    ${AVAILABLE_STYLES.map(
                        (style) =>
                            `<option value="${style.value}" ${style.value === data.draftFaceStyles[data.selectedFaceIndex] ? 'selected' : ''}>${style.label}</option>`
                    ).join('')}
                </select>
            </label>
        </div>
    `;
}

function renderCoreSettings(data: DieModPanelData): string {
    return `
        <div class="die-mod-settings-block">
            <label class="die-mod-setting-field">
                <span class="die-mod-setting-label">mod</span>
                <select class="die-mod-setting-select" data-scope="core" data-field="mod" disabled>
                    ${AVAILABLE_CORE_MODS.map(
                        (mod) =>
                            `<option value="${mod.value}" ${mod.value === data.draftCoreMod ? 'selected' : ''}>${mod.label}</option>`
                    ).join('')}
                </select>
            </label>
            <label class="die-mod-setting-field">
                <span class="die-mod-setting-label">material</span>
                <select class="die-mod-setting-select" data-scope="core" data-field="material" disabled>
                    ${AVAILABLE_MATERIALS.map(
                        (material) =>
                            `<option value="${material.value}" ${material.value === data.draftCoreMaterial ? 'selected' : ''}>${material.label}</option>`
                    ).join('')}
                </select>
            </label>
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
                            ${item.label}
                        </button>`
                )
                .join('')}
        </div>
    `;
}


