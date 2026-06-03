import Entity from '../../engine/js/entities/character/Entity';
import type { EntityOptions } from '../../engine/js/entities/character/EntityOptions';
import { FACTORY_CREATED_SYMBOL } from '../../engine/js/entities/character/EntityBuilder';
import { generateId } from '../../engine/js/util/javascript-extensions';
import Events from '../../engine/js/events';
import { DEFAULT_DICE_CONFIG } from './Dice';
import { isRenderPipStyle, type PipStyleSetting } from './PipStyle';
import { TrickEvents, type DiePropertyChangeRequest, type DiePropertyChangeRequestedEvent } from './contracts/TrickContracts';
import { DIE_BODY_MATERIALS, DIE_SURFACE_FINISHES } from '../rendering/textures/DieTextureTypes';

export interface DieOptions extends EntityOptions {
    faceCount?: number;
    id?: string;
    randomizer?: () => number;
    edgeRoundness?: number;
    bodyMaterial?: string;
    pipMaterial?: string;
    surfaceFinish?: string;
    pipStyle?: string;
    pipSize?: number;
}

const VALID_BODY_MATERIALS = new Set<string>(DIE_BODY_MATERIALS);
const VALID_SURFACE_FINISHES = new Set<string>(DIE_SURFACE_FINISHES);

function stripKnownMaterialPrefix(name: string): string {
    const trimmedName = name.trim();
    const [firstWord, ...rest] = trimmedName.split(/\s+/);
    if (rest.length === 0) {
        return trimmedName;
    }

    if (!VALID_BODY_MATERIALS.has(firstWord.toLowerCase())) {
        return trimmedName;
    }

    return rest.join(' ');
}

export class Die extends Entity {
    readonly faceCount: number;
    private readonly randomizer: () => number;
    private readonly diePropertyChangeSubscriptionId: string | null;
    private readonly baseName: string;
    private _bodyMaterial: string;
    private _pipMaterial: string;
    private _surfaceFinish: string;
    private _pipStyle: PipStyleSetting;
    private _pipSize: number;
    faceUp: number;
    active: boolean;
    locked: boolean;
    edgeRoundness: number;
    // TODO: Move faceUp/active/locked/edgeRoundness to readonly external access with event-requested mutation boundary like cosmetics.
    get bodyMaterial(): string { return this._bodyMaterial; }
    get pipMaterial(): string { return this._pipMaterial; }
    get surfaceFinish(): string { return this._surfaceFinish; }
    get pipStyle(): PipStyleSetting { return this._pipStyle; }
    get pipSize(): number { return this._pipSize; }

    constructor({
        faceCount = 6,
        id = generateId(),
        randomizer = Math.random,
        edgeRoundness = DEFAULT_DICE_CONFIG.edgeRoundness ?? 0.16,
        bodyMaterial,
        pipMaterial,
        surfaceFinish,
        pipStyle,
        pipSize,
        ...entityOptions
    }: DieOptions = {}) {
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
        this.baseName = stripKnownMaterialPrefix(this.name);
        this._bodyMaterial = DEFAULT_DICE_CONFIG.bodyMaterial ?? 'plastic';
        this._pipMaterial = DEFAULT_DICE_CONFIG.pipMaterial ?? 'plastic';
        this._surfaceFinish = DEFAULT_DICE_CONFIG.surfaceFinish ?? 'plain';
        this._pipStyle = DEFAULT_DICE_CONFIG.pipStyle ?? '';
        this.edgeRoundness = edgeRoundness;
        this._pipSize = DEFAULT_DICE_CONFIG.pipSize ?? 1;

        this.applyRequestedPropertyChanges({
            bodyMaterial,
            pipMaterial,
            surfaceFinish,
            pipStyle,
            pipSize,
        });

        this.diePropertyChangeSubscriptionId = Events.Subscribe<DiePropertyChangeRequestedEvent>(
            TrickEvents.DIE_PROPERTY_CHANGE_REQUESTED,
            (event) => {
                if (event.dieId !== this.id) {
                    return;
                }

                const didChange = this.applyRequestedPropertyChanges(event.changes);
                if (didChange) {
                    Events.RaiseEvent(TrickEvents.BAG_CHANGED, null);
                }
            }
        );
    }

    private applyRequestedPropertyChanges(changes: DiePropertyChangeRequest): boolean {
        let didChange = false;

        if (typeof changes.bodyMaterial === 'string' && VALID_BODY_MATERIALS.has(changes.bodyMaterial)) {
            if (this._bodyMaterial !== changes.bodyMaterial) {
                this._bodyMaterial = changes.bodyMaterial;
                this.name = `${changes.bodyMaterial} ${this.baseName}`;
                didChange = true;
            }
        }

        if (typeof changes.pipMaterial === 'string' && VALID_BODY_MATERIALS.has(changes.pipMaterial)) {
            if (this._pipMaterial !== changes.pipMaterial) {
                this._pipMaterial = changes.pipMaterial;
                didChange = true;
            }
        }

        if (typeof changes.surfaceFinish === 'string' && VALID_SURFACE_FINISHES.has(changes.surfaceFinish)) {
            if (this._surfaceFinish !== changes.surfaceFinish) {
                this._surfaceFinish = changes.surfaceFinish;
                didChange = true;
            }
        }

        if (typeof changes.pipStyle === 'string') {
            const nextPipStyle = changes.pipStyle === '' ? '' : isRenderPipStyle(changes.pipStyle) ? changes.pipStyle : null;
            if (nextPipStyle !== null && this._pipStyle !== nextPipStyle) {
                this._pipStyle = nextPipStyle;
                didChange = true;
            }
        }

        if (typeof changes.pipSize === 'number' && Number.isFinite(changes.pipSize)) {
            const nextPipSize = Math.max(0, changes.pipSize);
            if (this._pipSize !== nextPipSize) {
                this._pipSize = nextPipSize;
                didChange = true;
            }
        }

        if (typeof changes.name === 'string') {
            const nextName = changes.name.trim();
            if (nextName && this.name !== nextName) {
                this.name = nextName;
                didChange = true;
            }
        }

        return didChange;
    }

    override destroy(): void {
        if (this.diePropertyChangeSubscriptionId) {
            Events.Unsubscribe(this.diePropertyChangeSubscriptionId);
        }
        super.destroy();
    }

    roll(): number {
        this.faceUp = Math.floor(this.randomizer() * this.faceCount) + 1;
        return this.faceUp;
    }

}
