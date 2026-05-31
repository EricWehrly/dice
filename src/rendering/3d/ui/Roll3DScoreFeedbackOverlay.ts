import * as THREE from 'three';
import Entity from '../../../../engine/js/entities/character/Entity';
import Events from '../../../../engine/js/events';
import ThreeJSRenderContext from '../../../../engine/js/rendering/contexts/ThreeJS.RenderContext';
import { GetEntity3DGraphic } from '../../../../engine/js/rendering/entities/entity-3d-graphics';
import { type BagRolledEvent } from '../../../game/Bag';
import { TrickEvents } from '../../../game/contracts/TrickContracts';
import { type ScoreUpdatedEvent } from '../../../game/score/ScoreProgressionTracker';
import { ResourceNames, resourceIcons } from '../../../game/resources/GameResources';

interface Roll3DScoreFeedbackOverlayOptions {
    roll3dScreen: HTMLElement;
    roll3dCanvasHost: HTMLElement;
}

interface LabelEntry {
    dieId: string;
    element: HTMLDivElement;
    fadeInAtMs: number;
    fadeOutAtMs: number;
    removeAtMs: number;
}

interface TokenScheduleEntry {
    id: string;
    dieId: string;
    spawnAtMs: number;
    offsetX: number;
}

interface TokenEntry {
    id: string;
    dieId: string;
    element: HTMLDivElement;
    spawnedAtMs: number;
    removeAtMs: number;
    offsetX: number;
}

const ROLL_RESOLVE_DELAY_MS = 120;
const NO_GAIN_VISIBLE_MS = 700;
const SCORE_WINDOW_MS = 2000;
const FADE_DURATION_MS = 220;
const LABEL_Y_OFFSET = 2.0;
const TOKEN_Y_OFFSET = 1.45;
const TOKEN_RISE_WORLD_UNITS = 1.15;
const TOKEN_VISIBLE_MS = 650;
const LABEL_TEXT = `${resourceIcons[ResourceNames.highScore]} 0`;
const TOKEN_TEXT = `${resourceIcons[ResourceNames.highScore]}`;

let initialized = false;

export function setupRoll3DScoreFeedbackOverlay(options: Roll3DScoreFeedbackOverlayOptions): void {
    if (initialized) {
        return;
    }

    initialized = true;
    const overlay = new Roll3DScoreFeedbackOverlay(options);
    overlay.initialize();
}

class Roll3DScoreFeedbackOverlay {
    private readonly roll3dScreen: HTMLElement;
    private readonly overlayRoot: HTMLDivElement;
    private readonly labels = new Map<string, LabelEntry>();
    private readonly activeTokens = new Map<string, TokenEntry>();
    private readonly pendingTokenSchedule: TokenScheduleEntry[] = [];
    private readonly worldPosition = new THREE.Vector3();
    private tokenSequence = 0;
    private currentRollResolveAtMs = 0;

    constructor(options: Roll3DScoreFeedbackOverlayOptions) {
        this.roll3dScreen = options.roll3dScreen;
        this.overlayRoot = document.createElement('div');
        this.overlayRoot.className = 'roll3d-score-overlay';
        options.roll3dCanvasHost.appendChild(this.overlayRoot);
    }

    initialize(): void {
        Events.Subscribe<BagRolledEvent>(TrickEvents.BAG_ROLLED, this.onBagRolled.bind(this));
        Events.Subscribe<ScoreUpdatedEvent>(TrickEvents.SCORE_UPDATED, this.onScoreUpdated.bind(this));
        ThreeJSRenderContext.RegisterRenderMethod(110, () => this.update());
    }

    private onBagRolled(event: BagRolledEvent): void {
        this.clearLabels();
        this.clearTokens();

        const nowMs = performance.now();
        this.currentRollResolveAtMs = nowMs + ROLL_RESOLVE_DELAY_MS;
        const fadeOutAtMs = this.currentRollResolveAtMs + NO_GAIN_VISIBLE_MS;

        for (const dieId of event.diceIds) {
            const element = document.createElement('div');
            element.className = 'roll3d-score-label';
            element.textContent = LABEL_TEXT;
            this.overlayRoot.appendChild(element);

            this.labels.set(dieId, {
                dieId,
                element,
                fadeInAtMs: this.currentRollResolveAtMs,
                fadeOutAtMs,
                removeAtMs: fadeOutAtMs + FADE_DURATION_MS,
            });
        }
    }

    private onScoreUpdated(event: ScoreUpdatedEvent): void {
        const scoreDelta = event.highScore - event.previousHighScore;
        if (scoreDelta <= 0 || this.labels.size === 0) {
            return;
        }

        const fadeOutAtMs = this.currentRollResolveAtMs + SCORE_WINDOW_MS;
        for (const label of this.labels.values()) {
            label.fadeOutAtMs = Math.max(label.fadeOutAtMs, fadeOutAtMs);
            label.removeAtMs = label.fadeOutAtMs + FADE_DURATION_MS;
        }

        this.scheduleTokens(scoreDelta);
    }

    private scheduleTokens(tokenCount: number): void {
        const dieIds = Array.from(this.labels.keys());
        if (dieIds.length === 0) {
            return;
        }

        const scheduleWindowStartMs = this.currentRollResolveAtMs;
        const spawnIntervalMs = tokenCount > 1 ? SCORE_WINDOW_MS / (tokenCount - 1) : 0;

        for (let index = 0; index < tokenCount; index += 1) {
            this.tokenSequence += 1;
            const id = `score-token-${this.tokenSequence}`;
            const dieId = dieIds[index % dieIds.length];
            const spawnAtMs = scheduleWindowStartMs + index * spawnIntervalMs;
            const offsetX = this.createTokenOffset(index, dieIds.length);

            this.pendingTokenSchedule.push({
                id,
                dieId,
                spawnAtMs,
                offsetX,
            });
        }

        this.pendingTokenSchedule.sort((first, second) => first.spawnAtMs - second.spawnAtMs);
    }

    private createTokenOffset(index: number, dieCount: number): number {
        const spread = 0.24;
        const slot = (index % Math.max(dieCount, 2)) - 0.5;
        return slot * spread;
    }

    private update(): void {
        this.overlayRoot.style.display = this.roll3dScreen.classList.contains('is-hidden') ? 'none' : '';

        const nowMs = performance.now();
        this.spawnDueTokens(nowMs);

        if (this.labels.size > 0) {
            this.updateLabels(nowMs);
        }

        if (this.activeTokens.size > 0) {
            this.updateTokens(nowMs);
        }
    }

    private spawnDueTokens(nowMs: number): void {
        while (this.pendingTokenSchedule.length > 0 && this.pendingTokenSchedule[0].spawnAtMs <= nowMs) {
            const schedule = this.pendingTokenSchedule.shift();
            if (!schedule) {
                return;
            }

            const element = document.createElement('div');
            element.className = 'roll3d-score-token';
            element.textContent = TOKEN_TEXT;
            this.overlayRoot.appendChild(element);
            requestAnimationFrame(() => {
                element.classList.add('is-visible');
            });

            this.activeTokens.set(schedule.id, {
                id: schedule.id,
                dieId: schedule.dieId,
                element,
                spawnedAtMs: nowMs,
                removeAtMs: nowMs + TOKEN_VISIBLE_MS,
                offsetX: schedule.offsetX,
            });
        }
    }

    private updateLabels(nowMs: number): void {
        const renderContext = ThreeJSRenderContext.Instance;
        const camera = renderContext.camera as THREE.PerspectiveCamera;
        const canvas = renderContext.canvas;

        for (const [dieId, label] of this.labels) {
            const object3d = this.getDieGraphic(dieId);

            if (!object3d) {
                label.element.classList.remove('is-visible');
                label.element.style.display = 'none';
                if (nowMs >= label.removeAtMs) {
                    label.element.remove();
                    this.labels.delete(dieId);
                }
                continue;
            }

            object3d.getWorldPosition(this.worldPosition);
            this.worldPosition.y += LABEL_Y_OFFSET;
            this.worldPosition.project(camera);

            if (!this.isProjectedPointVisible(this.worldPosition)) {
                label.element.style.display = 'none';
                continue;
            }

            const screenX = (this.worldPosition.x * 0.5 + 0.5) * canvas.clientWidth;
            const screenY = (-this.worldPosition.y * 0.5 + 0.5) * canvas.clientHeight;

            label.element.style.display = '';
            label.element.style.left = `${screenX}px`;
            label.element.style.top = `${screenY}px`;

            if (nowMs >= label.fadeInAtMs && nowMs < label.fadeOutAtMs) {
                label.element.classList.add('is-visible');
            } else {
                label.element.classList.remove('is-visible');
            }

            if (nowMs >= label.removeAtMs) {
                label.element.remove();
                this.labels.delete(dieId);
            }
        }
    }

    private updateTokens(nowMs: number): void {
        const renderContext = ThreeJSRenderContext.Instance;
        const camera = renderContext.camera as THREE.PerspectiveCamera;
        const canvas = renderContext.canvas;

        for (const [tokenId, token] of this.activeTokens) {
            const object3d = this.getDieGraphic(token.dieId);

            if (!object3d) {
                token.element.remove();
                this.activeTokens.delete(tokenId);
                continue;
            }

            const lifeProgress = Math.min(Math.max((nowMs - token.spawnedAtMs) / TOKEN_VISIBLE_MS, 0), 1);
            object3d.getWorldPosition(this.worldPosition);
            this.worldPosition.x += token.offsetX;
            this.worldPosition.y += TOKEN_Y_OFFSET + lifeProgress * TOKEN_RISE_WORLD_UNITS;
            this.worldPosition.project(camera);

            if (!this.isProjectedPointVisible(this.worldPosition)) {
                token.element.style.display = 'none';
            } else {
                const screenX = (this.worldPosition.x * 0.5 + 0.5) * canvas.clientWidth;
                const screenY = (-this.worldPosition.y * 0.5 + 0.5) * canvas.clientHeight;
                token.element.style.display = '';
                token.element.style.left = `${screenX}px`;
                token.element.style.top = `${screenY}px`;
            }

            if (nowMs >= token.removeAtMs) {
                token.element.remove();
                this.activeTokens.delete(tokenId);
            }
        }
    }

    private getDieGraphic(dieId: string): THREE.Object3D | undefined {
        const entity = Entity.List.find((candidate) => candidate.id === dieId);
        return entity ? GetEntity3DGraphic(entity) : undefined;
    }

    private isProjectedPointVisible(position: THREE.Vector3): boolean {
        return position.z >= -1 && position.z <= 1;
    }

    private clearLabels(): void {
        for (const label of this.labels.values()) {
            label.element.remove();
        }
        this.labels.clear();
    }

    private clearTokens(): void {
        this.pendingTokenSchedule.length = 0;
        for (const token of this.activeTokens.values()) {
            token.element.remove();
        }
        this.activeTokens.clear();
    }
}
