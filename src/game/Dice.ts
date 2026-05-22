import { EntityOptions } from '../../engine/js/entities/character/EntityOptions';

/**
 * Dice-specific configuration stored on entities
 */
export interface DiceConfig extends EntityOptions {
    faceCount: number;
    foreColor: string;
    backColor: string;
    pipStyle?: string;
}

/**
 * Default dice configuration
 */
export const DEFAULT_DICE_CONFIG: DiceConfig = {
    faceCount: 6,
    foreColor: '#000000',
    backColor: '#ffffff',
    pipStyle: ''
};

/**
 * Helper to get dice config from an entity
 */
export function getDiceConfig(entity: any): DiceConfig {
    if (!entity) return DEFAULT_DICE_CONFIG;
    
    // Read properties directly from entity
    return {
        faceCount: entity.faceCount ?? DEFAULT_DICE_CONFIG.faceCount,
        foreColor: entity.foreColor ?? DEFAULT_DICE_CONFIG.foreColor,
        backColor: entity.backColor ?? DEFAULT_DICE_CONFIG.backColor,
        pipStyle: entity.pipStyle ?? DEFAULT_DICE_CONFIG.pipStyle
    };
}

// Public entity name constant for renderer registration and lookups
export const ENTITY_NAME = 'Dice';
