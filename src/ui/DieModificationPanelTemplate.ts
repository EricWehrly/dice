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
    type MaterialFamilyValue,
    type AvailableFaceStyleValue,
    type AvailableStyleValue,
    AVAILABLE_MODS,
    AVAILABLE_CORE_MODS,
    AVAILABLE_FACE_STYLES,
    MATERIAL_FAMILIES,
    AVAILABLE_STYLES,
} from './DieModificationTypes';

function renderMaterialOptions(selected: AvailableMaterialValue): string {
    return MATERIAL_FAMILIES.map(
        (group) => `<optgroup label="${group.label}">${
            group.materials.map(
                (m) => `<option value="${m.value}"${m.value === selected ? ' selected' : ''}>${m.label}</option>`
            ).join('')
        }</optgroup>`
    ).join('');
}

function renderMaterialFamilyOptions(selected: MaterialFamilyValue): string {
    return MATERIAL_FAMILIES.map(
        (family) => `<option value="${family.family}"${family.family === selected ? ' selected' : ''}>${family.label}</option>`
    ).join('');
}

function renderMaterialOptionsForFamily(family: MaterialFamilyValue, selected: AvailableMaterialValue): string {
    const familyDef = MATERIAL_FAMILIES.find((f) => f.family === family);
    if (!familyDef) {
        return '';
    }
    return familyDef.materials.map(
        (m) => `<option value="${m.value}"${m.value === selected ? ' selected' : ''}>${m.label}</option>`
    ).join('');
}

export interface DieModPanelData {
    dice: Array<{ id: string; name: string; faceCount: number }>;
    selectedDieId: string;
    selectedFaceIndex: number; // -1 = core, 0+ = face index
    faceCount: number;
    draftFaceMods: AvailableModValue[];
    draftCoreMod: AvailableCoreModValue;
    draftCoreMaterialFamily: MaterialFamilyValue;
    draftCoreMaterial: AvailableMaterialValue;
    draftPipMaterialFamily: MaterialFamilyValue;
    draftPipMaterial: AvailableMaterialValue;
    draftFaceStyles: AvailableStyleValue[];
    draftFaceStyle: AvailableFaceStyleValue;
    draftPipSize: number;
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
            <!-- TODO: align die labels along bottoms of die in scene view -->
            ${renderDieList(data)}

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

            <!-- Sub-properties container: zero height when empty, slides in when mod selected -->
            <div class="die-mod-sub-props${data.showTargetFaceSelector ? ' is-visible' : ''}${data.targetFaceAnimation === 'leave' ? ' is-leaving' : ''}">
                <div class="die-mod-sub-field die-mod-face-selector-row${data.showTargetFaceSelector ? ' is-visible' : ''}${data.targetFaceAnimation === 'enter' ? ' is-entering' : ''}${data.targetFaceAnimation === 'leave' ? ' is-leaving' : ''}">
                    <span class="die-mod-setting-label die-mod-setting-label--sub">target face</span>
                    <div class="die-mod-face-carousel-stage" data-carousel-mode="auto">
                        <button class="die-mod-face-nav die-mod-face-nav-prev" type="button" aria-label="Previous target face">&lt;</button>
                        <div class="die-mod-canvas-wrap die-mod-canvas-wrap--selector">
                            <canvas id="die-mod-canvas"></canvas>
                        </div>
                        <button class="die-mod-face-nav die-mod-face-nav-next" type="button" aria-label="Next target face">&gt;</button>
                    </div>
                </div>
            </div>

            <!-- Body material family selector -->
            <label class="die-mod-setting-field">
                <span class="die-mod-setting-label">body material family</span>
                <select class="die-mod-setting-select die-mod-body-material-family-selector">
                    ${renderMaterialFamilyOptions(data.draftCoreMaterialFamily)}
                </select>
            </label>

            <!-- Body material selector (for materials within the family) -->
            <label class="die-mod-setting-field">
                <span class="die-mod-setting-label">body material</span>
                <select class="die-mod-setting-select die-mod-body-material-selector">
                    ${renderMaterialOptionsForFamily(data.draftCoreMaterialFamily, data.draftCoreMaterial)}
                </select>
            </label>

            <!-- Pip material family selector -->
            <label class="die-mod-setting-field">
                <span class="die-mod-setting-label">pip material family</span>
                <select class="die-mod-setting-select die-mod-pip-material-family-selector">
                    ${renderMaterialFamilyOptions(data.draftPipMaterialFamily)}
                </select>
            </label>

            <!-- Pip material selector (for materials within the family) -->
            <label class="die-mod-setting-field">
                <span class="die-mod-setting-label">pip material</span>
                <select class="die-mod-setting-select die-mod-pip-material-selector">
                    ${renderMaterialOptionsForFamily(data.draftPipMaterialFamily, data.draftPipMaterial)}
                </select>
            </label>

            <label class="die-mod-setting-field">
                <span class="die-mod-setting-label">finish</span>
                <select class="die-mod-setting-select die-mod-style-selector">
                    ${AVAILABLE_STYLES.map(
                        (style) =>
                            `<option value="${style.value}" ${style.value === data.draftFaceStyles[0] ? 'selected' : ''}>${style.label}</option>`
                    ).join('')}
                </select>
            </label>

            <label class="die-mod-setting-field">
                <span class="die-mod-setting-label">pip style</span>
                <select class="die-mod-setting-select die-mod-face-style-selector">
                    ${AVAILABLE_FACE_STYLES.map(
                        (faceStyle) =>
                            `<option value="${faceStyle.value}" ${faceStyle.value === data.draftFaceStyle ? 'selected' : ''}>${faceStyle.label}</option>`
                    ).join('')}
                </select>
            </label>

            <label class="die-mod-setting-field">
                <span class="die-mod-setting-label">pip size</span>
                <input class="die-mod-setting-select die-mod-pip-size-input" type="number" min="0" step="0.1" value="${data.draftPipSize}">
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


