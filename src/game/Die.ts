import Entity from '../../engine/js/entities/character/Entity';
import type { EntityOptions } from '../../engine/js/entities/character/EntityOptions';
import { FACTORY_CREATED_SYMBOL } from '../../engine/js/entities/character/EntityBuilder';
import { generateId } from '../../engine/js/util/javascript-extensions';

export interface DieOptions extends EntityOptions {
    faceCount?: number;
    id?: string;
    randomizer?: () => number;
}

export class Die extends Entity {
    readonly faceCount: number;
    private readonly randomizer: () => number;
    faceUp: number;
    active: boolean;
    locked: boolean;
    bodyMaterial: string;
    pipMaterial: string;
    surfaceFinish: string;

    constructor({ faceCount = 6, id = generateId(), randomizer = Math.random, ...entityOptions }: DieOptions = {}) {
        if (!Number.isInteger(faceCount) || faceCount < 2) {
            throw new Error('faceCount must be an integer >= 2');
        }

        const resolvedName = entityOptions.name ?? `d${faceCount}`;

        super({
            ...entityOptions,
            id,
            name: resolvedName,
            [FACTORY_CREATED_SYMBOL]: true, // circumvent engine factory restriction, allow 'new Die()'
        });

        this.faceCount = faceCount;
        this.randomizer = randomizer;
        this.faceUp = 1;
        this.active = true;
        this.locked = false;
        this.bodyMaterial = 'plastic';
        this.pipMaterial = 'plastic';
        this.surfaceFinish = 'plain';
    }

    roll(): number {
        this.faceUp = Math.floor(this.randomizer() * this.faceCount) + 1;
        return this.faceUp;
    }

}
