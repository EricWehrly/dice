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

export const AVAILABLE_BRAIN_MODS = [
    { value: 'none', label: '---', grams: 0 },
    { value: 'brain', label: 'Brain', grams: 0 },
] as const;

export type AvailableModValue = typeof AVAILABLE_MODS[number]['value'];
export type AvailableBrainModValue = typeof AVAILABLE_BRAIN_MODS[number]['value'];
