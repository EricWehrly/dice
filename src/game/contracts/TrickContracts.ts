import type { GameEvent } from '../../../engine/js/events';

export interface DiePropertyChangeRequest {
    bodyMaterial?: string;
    pipMaterial?: string;
    surfaceFinish?: string;
    pipStyle?: string;
    pipSize?: number;
    name?: string;
}

export interface DiePropertyChangeRequestedEvent extends GameEvent {
    dieId: string;
    changes: DiePropertyChangeRequest;
}

export const TrickEvents = {
    BAG_ROLLED: 'bag:rolled',
    BAG_CHANGED: 'bag:changed',
    ROLL_EVALUATED: 'trick:roll-evaluated',
    TRICK_DISCOVERED: 'trick:discovered',
    TRICK_HIGH_SCORE: 'trick:high-score',
    SCORE_UPDATED: 'score:updated',
    DIE_SELECTED: 'die:selected',
    DIE_PROPERTY_CHANGE_REQUESTED: 'die:property-change-requested',
} as const;
