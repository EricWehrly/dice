/**
 * DieModificationPanel Templates
 * 
 * HTML template functions for the die modification UI.
 * Separated from component logic for reusability and testing.
 */

import {
    type AvailableModValue,
    type AvailableCoreModValue,
    AVAILABLE_MODS,
    AVAILABLE_CORE_MODS,
} from './DieModificationTypes';

export interface DieModPanelData {
    dice: Array<{ id: string; label: string; faceCount: number }>;
    selectedDieId: string;
    draftFaceMods: AvailableModValue[];
    draftCoreMod: AvailableCoreModValue;
    preview: number[];
    deltas: number[];
    current: number[];
    faceCount: number;
    centerPosition: number;
    hasDraftChanges: boolean;
    hasActualDeltas: boolean;
    installedModCount: number;
}

export function renderDieModPanel(data: DieModPanelData): string {
    return `
        <h3>Die Modifications</h3>

        ${renderDieList(data)}
        
        <div class="die-mod-canvas-wrap">
            <canvas id="die-mod-canvas"></canvas>
        </div>

        ${renderModRow(data)}

        ${renderValuesSection(data)}

        <p class="die-mod-caption">Installed mods on selected die: ${data.installedModCount}</p>
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

function renderModRow(data: DieModPanelData): string {
    return `
        <div class="die-mod-row">
            <div class="die-mod-picker die-mod-label">mod</div>

            <div class="die-mod-face-targets">
                <div class="die-mod-face-target-grid">
                    ${Array.from({ length: data.faceCount }, (_, index) => {
                        if (index === data.centerPosition) {
                            return `
                                <label class="die-mod-face-target die-mod-core-slot" title="Die core">
                                    <span class="die-mod-slot-label die-mod-core-slot-label">core</span>
                                    <select id="die-mod-core-select" class="die-mod-select">
                                        ${AVAILABLE_CORE_MODS.map(
                                            (mod) =>
                                                `<option value="${mod.value}" ${mod.value === data.draftCoreMod ? 'selected' : ''}>${mod.label}</option>`
                                        ).join('')}
                                    </select>
                                </label>
                                <label class="die-mod-face-target" title="Face ${index + 1}">
                                    <select class="die-mod-select" data-face-index="${index}">
                                        ${AVAILABLE_MODS.map(
                                            (mod) =>
                                                `<option value="${mod.value}" ${mod.value === data.draftFaceMods[index] ? 'selected' : ''}>${mod.label}</option>`
                                        ).join('')}
                                    </select>
                                </label>
                            `;
                        }
                        return `
                            <label class="die-mod-face-target" title="Face ${index + 1}">
                                <select class="die-mod-select" data-face-index="${index}">
                                    ${AVAILABLE_MODS.map(
                                        (mod) =>
                                            `<option value="${mod.value}" ${mod.value === data.draftFaceMods[index] ? 'selected' : ''}>${mod.label}</option>`
                                    ).join('')}
                                </select>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>

            <button id="die-mod-install-btn" class="die-mod-install-btn" type="button" ${data.hasDraftChanges ? '' : 'disabled'}>Install</button>
        </div>
    `;
}

function renderValuesSection(data: DieModPanelData): string {
    return `
        <div class="die-mod-values">
            <div class="die-mod-value-row">
                <div class="die-mod-row-label">up chance</div>
                <div class="die-mod-value-grid">
                    ${Array.from({ length: data.faceCount + 1 }, (_, displayIndex) => {
                        if (displayIndex === data.centerPosition) {
                            return '<div class="die-mod-value-cell die-mod-core-gap"></div>';
                        }
                        const faceIndex = displayIndex < data.centerPosition ? displayIndex : displayIndex - 1;
                        const value = data.preview[faceIndex] ?? 0;
                        return `<div class="die-mod-value-cell">${value.toFixed(1)}%</div>`;
                    }).join('')}
                </div>
            </div>
            ${
                data.hasActualDeltas
                    ? `<div class="die-mod-value-row">
                <div class="die-mod-row-label"></div>
                <div class="die-mod-value-grid">
                    ${Array.from({ length: data.faceCount + 1 }, (_, displayIndex) => {
                        if (displayIndex === data.centerPosition) {
                            return '<div class="die-mod-value-cell die-mod-core-gap"></div>';
                        }
                        const faceIndex = displayIndex < data.centerPosition ? displayIndex : displayIndex - 1;
                        const delta = data.deltas[faceIndex] ?? 0;
                        const className = delta > 0 ? 'delta-up' : delta < 0 ? 'delta-down' : '';
                        const value = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`;
                        return `<div class="die-mod-value-cell ${className}">${value}</div>`;
                    }).join('')}
                </div>
            </div>`
                    : ''
            }
        </div>
    `;
}
