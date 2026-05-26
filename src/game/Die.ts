import { generateId } from '../../engine/js/util/javascript-extensions';

export interface DieOptions {
    faceCount?: number;
    id?: string;
    label?: string;
    randomizer?: () => number;
}

export class Die {
    readonly id: string;
    readonly faceCount: number;
    private readonly randomizer: () => number;
    faceUp: number;
    active: boolean;
    locked: boolean;
    label: string;

    constructor({ faceCount = 6, id = generateId(), label, randomizer = Math.random }: DieOptions = {}) {
        if (!Number.isInteger(faceCount) || faceCount < 2) {
            throw new Error('faceCount must be an integer >= 2');
        }

        this.id = id;
        this.faceCount = faceCount;
        this.randomizer = randomizer;
        this.faceUp = 1;
        this.active = true;
        this.locked = false;
        this.label = label ?? `d${faceCount}`;
    }

    roll(): number {
        this.faceUp = Math.floor(this.randomizer() * this.faceCount) + 1;
        return this.faceUp;
    }

}
