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
    name?: string;
    randomizer?: () => number;
    faceUp?: number;
    active?: boolean;
    locked?: boolean;
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
    private autoMaterialNameEnabled: boolean;
    private _faceUp: number;
    private _active: boolean;
    private _locked: boolean;
    private _edgeRoundness: number;
    private _bodyMaterial: string;
    private _pipMaterial: string;
    private _surfaceFinish: string;
    private _pipStyle: PipStyleSetting;
    private _pipSize: number;
    get faceUp(): number { return this._faceUp; }
    get active(): boolean { return this._active; }
    get locked(): boolean { return this._locked; }
    get edgeRoundness(): number { return this._edgeRoundness; }
    get bodyMaterial(): string { return this._bodyMaterial; }
    get pipMaterial(): string { return this._pipMaterial; }
    get surfaceFinish(): string { return this._surfaceFinish; }
    get pipStyle(): PipStyleSetting { return this._pipStyle; }
    get pipSize(): number { return this._pipSize; }

    constructor({
        faceCount = 6,
        id = generateId(),
        randomizer = Math.random,
        faceUp,
        active,
        locked,
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

        const hasExplicitName = typeof entityOptions.name === 'string' && entityOptions.name.trim().length > 0;
        const resolvedName = entityOptions.name ?? `d${faceCount}`;

        super({
            ...entityOptions,
            id,
            name: resolvedName,
            [FACTORY_CREATED_SYMBOL]: true, // circumvent engine factory restriction, allow 'new Die()'
        });

        this.faceCount = faceCount;
        this.randomizer = randomizer;
        this._faceUp = 1;
        this._active = true;
        this._locked = false;
        this.baseName = stripKnownMaterialPrefix(this.name);
        this.autoMaterialNameEnabled = !hasExplicitName;
        this._bodyMaterial = DEFAULT_DICE_CONFIG.bodyMaterial ?? 'plastic';
        this._pipMaterial = DEFAULT_DICE_CONFIG.pipMaterial ?? 'plastic';
        this._surfaceFinish = DEFAULT_DICE_CONFIG.surfaceFinish ?? 'plain';
        this._pipStyle = DEFAULT_DICE_CONFIG.pipStyle ?? '';
        this._edgeRoundness = edgeRoundness;
        this._pipSize = DEFAULT_DICE_CONFIG.pipSize ?? 1;

        this.applyRequestedPropertyChanges({
            faceUp,
            active,
            locked,
            edgeRoundness,
            bodyMaterial,
            pipMaterial,
            surfaceFinish,
            pipStyle,
            pipSize,
        });

        if (this.autoMaterialNameEnabled) {
            this.name = `${this._bodyMaterial} ${this.baseName}`;
        }

        this.diePropertyChangeSubscriptionId = Events.Subscribe<DiePropertyChangeRequestedEvent>(
            TrickEvents.DIE_PROPERTY_CHANGE_REQUESTED,
            (event) => {
                if (event.dieId !== this.id) {
                    return;
                }

                this.applyRequestedPropertyChanges(event.changes);
            }
        );
    }

    private applyRequestedPropertyChanges(changes: DiePropertyChangeRequest): boolean {
        let didChange = false;

        if (typeof changes.faceUp === 'number' && Number.isInteger(changes.faceUp) && changes.faceUp >= 1 && changes.faceUp <= this.faceCount) {
            if (this._faceUp !== changes.faceUp) {
                this._faceUp = changes.faceUp;
                didChange = true;
            }
        }

        if (typeof changes.active === 'boolean') {
            if (this._active !== changes.active) {
                this._active = changes.active;
                didChange = true;
            }
        }

        if (typeof changes.locked === 'boolean') {
            if (this._locked !== changes.locked) {
                this._locked = changes.locked;
                didChange = true;
            }
        }

        if (typeof changes.edgeRoundness === 'number' && Number.isFinite(changes.edgeRoundness)) {
            const nextEdgeRoundness = Math.max(0, Math.min(0.5, changes.edgeRoundness));
            if (this._edgeRoundness !== nextEdgeRoundness) {
                this._edgeRoundness = nextEdgeRoundness;
                didChange = true;
            }
        }

        if (typeof changes.bodyMaterial === 'string' && VALID_BODY_MATERIALS.has(changes.bodyMaterial)) {
            if (this._bodyMaterial !== changes.bodyMaterial) {
                this._bodyMaterial = changes.bodyMaterial;
                if (this.autoMaterialNameEnabled) {
                    this.name = `${changes.bodyMaterial} ${this.baseName}`;
                }
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
                this.autoMaterialNameEnabled = false;
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
        this._faceUp = Math.floor(this.randomizer() * this.faceCount) + 1;
        return this._faceUp;
    }

}
