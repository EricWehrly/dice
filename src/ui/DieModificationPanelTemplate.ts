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
    // Phase 1: Collapsed/Expanded State
    panelMode: 'collapsed' | 'expanded'; // collapsed = viewing, expanded = installing
    selectedCoreMod: AvailableCoreModValue | null; // Selected from dropdown in collapsed mode
    selectedTargetFaceIndex: number | null; // Selected from face selector in expanded mode, null for core-only
}

export function renderDieModPanel(data: DieModPanelData): string {
    return `
        <div class="die-mod-shell">
            ${renderDieList(data)}
            
            ${data.panelMode === 'collapsed' 
                ? renderCollapsedMode(data)
                : renderExpandedMode(data)
            }
        </div>
    `;
}

/**
 * Collapsed Mode: Die display + core mod selector + style selector
 * User can browse and select a core mod to install.
 */
function renderCollapsedMode(data: DieModPanelData): string {
    return `
        <div class="die-mod-panel--collapsed">
            <!-- Isometric die rendering canvas -->
            <div class="die-mod-isometric-container">
                <canvas id="die-isometric-canvas"></canvas>
            </div>

            <!-- Core mod selector dropdown -->
            <label class="die-mod-setting-field">
                <span class="die-mod-setting-label">core mod</span>
                <select class="die-mod-setting-select die-mod-core-mod-selector" data-scope="core">
                    ${AVAILABLE_CORE_MODS.map(
                        (mod) =>
                            `<option value="${mod.value}" ${mod.value === data.selectedCoreMod ? 'selected' : ''}>${mod.label}</option>`
                    ).join('')}
                </select>
            </label>

            <!-- Style selector dropdown -->
            <label class="die-mod-setting-field">
                <span class="die-mod-setting-label">style</span>
                <select class="die-mod-setting-select die-mod-style-selector">
                    ${AVAILABLE_STYLES.map(
                        (style) =>
                            `<option value="${style.value}" ${style.value === data.draftFaceStyles[0] ? 'selected' : ''}>${style.label}</option>`
                    ).join('')}
                </select>
            </label>
        </div>
    `;
}

/**
 * Expanded Mode: Install workflow for selected core mod
 * Shows "Installing: [mod]" header, exploded face carousel, target selector, Install/Cancel buttons
 */
function renderExpandedMode(data: DieModPanelData): string {
    const modLabel = AVAILABLE_CORE_MODS.find(m => m.value === data.selectedCoreMod)?.label || 'Unknown';
    const isInstallDisabled = !data.selectedCoreMod || data.selectedTargetFaceIndex === undefined;

    return `
        <div class="die-mod-panel--expanded">
            <!-- Installing header -->
            <div class="die-mod-header">
                <h3 class="die-mod-title">Installing: ${modLabel}</h3>
            </div>

            <!-- Exploded face carousel (showing all faces with probabilities) -->
            <div class="die-mod-face-carousel" data-carousel-mode="auto">
                <button class="die-mod-face-nav-btn die-mod-face-nav-btn-prev" data-face-step="-1" type="button" aria-label="Previous">&lt;</button>
                <div class="die-mod-canvas-wrap">
                    <canvas id="die-mod-canvas"></canvas>
                </div>
                <button class="die-mod-face-nav-btn die-mod-face-nav-btn-next" data-face-step="1" type="button" aria-label="Next">&gt;</button>
            </div>

            <!-- Target face selector (only faces, not core) -->
            <label class="die-mod-setting-field">
                <span class="die-mod-setting-label">target face</span>
                <select class="die-mod-setting-select die-mod-target-face-selector">
                    <option value="">-- Select a face --</option>
                    ${Array.from({ length: data.faceCount }, (_, i) => {
                        const faceIndex = i; // 0-indexed face number
                        return `<option value="${faceIndex}" ${faceIndex === data.selectedTargetFaceIndex ? 'selected' : ''}>Face ${faceIndex + 1}</option>`;
                    }).join('')}
                </select>
            </label>

            <!-- Install / Cancel buttons -->
            <div class="die-mod-actions">
                <button class="die-mod-install-btn" type="button" ${isInstallDisabled ? 'disabled' : ''}>
                    Install
                </button>
                <button class="die-mod-cancel-btn" type="button">
                    Cancel
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


