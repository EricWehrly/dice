/**
 * Die Modification Types and Constants
 * 
 * Shared types and available modification options for the die modification panel.
 * Imported by both DieModificationPanel and DieModificationPanelTemplate.
 */

export const AVAILABLE_MODS = [
    { value: 'none', label: '---', grams: 0 },
    { value: 'weight-1.0', label: 'Weight 1.0g', grams: 1.0 },
    { value: 'weight-1.5', label: 'Weight 1.5g', grams: 1.5 },
    { value: 'weight-2.0', label: 'Weight 2.0g', grams: 2.0 },
    { value: 'weight-2.5', label: 'Weight 2.5g', grams: 2.5 },
] as const;

export const AVAILABLE_CORE_MODS = [
    { value: 'none', label: '---', grams: 0 },
    { value: 'weight-1.0', label: 'Weight 1.0g', grams: 1.0 },
    { value: 'weight-1.5', label: 'Weight 1.5g', grams: 1.5 },
    { value: 'weight-2.0', label: 'Weight 2.0g', grams: 2.0 },
    { value: 'weight-2.5', label: 'Weight 2.5g', grams: 2.5 },
    // FUTURE: { value: 'brain', label: 'Brain', grams: 0 }
    // Brain mod - AI-assisted adaptive weighting per face.
    // See: docs/active/roadmap.md "Planned Mods", docs/features/F-brain-mod.md (future)
] as const;

export const AVAILABLE_MATERIALS = [
    { value: 'plastic', label: 'Plastic' },
    { value: 'wood', label: 'Wood' },
    { value: 'stone', label: 'Stone' },
    { value: 'ceramic', label: 'Ceramic' },
    { value: 'resin', label: 'Resin' },
    { value: 'brass', label: 'Brass' },
    { value: 'steel', label: 'Steel' },
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
    { value: 'bronze', label: 'Bronze' },
    { value: 'copper', label: 'Copper' },
    { value: 'iron', label: 'Iron' },
    { value: 'titanium', label: 'Titanium' },
    { value: 'obsidian', label: 'Obsidian' },
    { value: 'jade', label: 'Jade' },
    { value: 'glass', label: 'Glass' },
    { value: 'crystal', label: 'Crystal' },
] as const;

export const AVAILABLE_STYLES = [
    { value: 'plain', label: 'Plain finish' },
    { value: 'etched', label: 'Etched finish' },
    { value: 'polished', label: 'Polished finish' },
    { value: 'hammered', label: 'Hammered finish' },
] as const;

export const AVAILABLE_FACE_STYLES = [
    { value: 'none', label: '---' },
    { value: 'circle', label: 'Circle (default)' },
    { value: 'x', label: 'X' },
    { value: 'clover', label: 'Clover' },
    { value: 'lock', label: 'Lock' },
] as const;

export type AvailableModValue = typeof AVAILABLE_MODS[number]['value'];
export type AvailableCoreModValue = typeof AVAILABLE_CORE_MODS[number]['value'];
export type AvailableMaterialValue = typeof AVAILABLE_MATERIALS[number]['value'];
export type AvailableStyleValue = typeof AVAILABLE_STYLES[number]['value'];
export type AvailableFaceStyleValue = typeof AVAILABLE_FACE_STYLES[number]['value'];
