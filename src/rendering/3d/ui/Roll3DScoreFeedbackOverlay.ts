import * as THREE from 'three';
import Entity from '../../../../engine/js/entities/character/Entity';
import Events from '../../../../engine/js/events';
import ThreeJSRenderContext from '../../../../engine/js/rendering/contexts/ThreeJS.RenderContext';
import { GetEntity3DGraphic } from '../../../../engine/js/rendering/entities/entity-3d-graphics';
import { type BagRolledEvent } from '../../../game/Bag';
import { TrickEvents } from '../../../game/contracts/TrickContracts';
import { ResourceNames, resourceIcons } from '../../../game/resources/GameResources';

interface Roll3DScoreFeedbackOverlayOptions {
    roll3dScreen: HTMLElement;
    roll3dCanvasHost: HTMLElement;
    getHighScoreCounterElement: () => HTMLElement | null;
}

interface LabelEntry {
    dieId: string;
    element: HTMLDivElement;
    targetValue: number;
    currentValue: number;
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
    startScreenX: number;
    startScreenY: number;
    bumpTriggered: boolean;
}

const ROLL_RESOLVE_DELAY_MS = 120;
const SCORE_WINDOW_MS = 2000;
const FADE_DURATION_MS = 220;
const LABEL_Y_OFFSET = 2.0;
const TOKEN_Y_OFFSET = 1.45;
const TOKEN_VISIBLE_MS = 800;
const BUMP_TRIGGER_PROGRESS = 0.85;
const LABEL_TEXT = `${resourceIcons[ResourceNames.highScore]} 0`;
const TOKEN_TEXT = resourceIcons[ResourceNames.highScore];

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
    private readonly getHighScoreCounterElement: () => HTMLElement | null;
    private readonly labels = new Map<string, LabelEntry>();
    private readonly activeTokens = new Map<string, TokenEntry>();
    private readonly pendingTokenSchedule: TokenScheduleEntry[] = [];
    private readonly worldPosition = new THREE.Vector3();
    private tokenSequence = 0;
    private currentRollResolveAtMs = 0;

    constructor(options: Roll3DScoreFeedbackOverlayOptions) {
        this.roll3dScreen = options.roll3dScreen;
        this.getHighScoreCounterElement = options.getHighScoreCounterElement;
        this.overlayRoot = document.createElement('div');
        this.overlayRoot.className = 'roll3d-score-overlay';
        options.roll3dCanvasHost.appendChild(this.overlayRoot);
    }

    initialize(): void {
        Events.Subscribe<BagRolledEvent>(TrickEvents.BAG_ROLLED, this.onBagRolled.bind(this));
        ThreeJSRenderContext.RegisterRenderMethod(110, () => this.update());
    }

    private onBagRolled(event: BagRolledEvent): void {
        console.log('[Score] onBagRolled - clearing, dice:', event.diceIds.length);
        this.clearLabels();
        this.clearTokens();

        const nowMs = performance.now();
        this.currentRollResolveAtMs = nowMs + ROLL_RESOLVE_DELAY_MS;

        const scoreWindowFadeOutAtMs = this.currentRollResolveAtMs + SCORE_WINDOW_MS + TOKEN_VISIBLE_MS;

        event.diceIds.forEach((dieId, index) => {
            const element = document.createElement('div');
            element.className = 'roll3d-score-label';
            const faceValue = event.faceResults[index]?.computed_value ?? 0;
            element.textContent = `${resourceIcons[ResourceNames.highScore]} 0`;
            this.overlayRoot.appendChild(element);

            this.labels.set(dieId, {
                dieId,
                element,
                targetValue: faceValue,
                currentValue: 0,
                fadeInAtMs: this.currentRollResolveAtMs,
                fadeOutAtMs: scoreWindowFadeOutAtMs,
                removeAtMs: scoreWindowFadeOutAtMs + FADE_DURATION_MS,
            });

            this.scheduleTokensForDie(dieId, faceValue);
        });
        console.log('[Score] onBagRolled - created', this.labels.size, 'labels');
    }

    private scheduleTokensForDie(dieId: string, count: number): void {
        if (count === 0) {
            return;
        }

        const spawnIntervalMs = count > 1 ? SCORE_WINDOW_MS / (count - 1) : 0;

        for (let index = 0; index < count; index += 1) {
            this.tokenSequence += 1;
            const id = `score-token-${this.tokenSequence}`;
            const spawnAtMs = this.currentRollResolveAtMs + index * spawnIntervalMs;
            const offsetX = (index % 2 === 0 ? 1 : -1) * Math.floor(index / 2) * 0.18;

            this.pendingTokenSchedule.push({ id, dieId, spawnAtMs, offsetX });
        }

        this.pendingTokenSchedule.sort((first, second) => first.spawnAtMs - second.spawnAtMs);
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
        const renderContext = ThreeJSRenderContext.Instance;
        const camera = renderContext.camera as THREE.PerspectiveCamera;
        const canvas = renderContext.canvas;

        if (this.pendingTokenSchedule.length > 0 && this.pendingTokenSchedule[0].spawnAtMs <= nowMs) {
            console.log('[Score] spawnDueTokens - spawning token, pending:', this.pendingTokenSchedule.length);
        }

        while (this.pendingTokenSchedule.length > 0 && this.pendingTokenSchedule[0].spawnAtMs <= nowMs) {
            const schedule = this.pendingTokenSchedule.shift();
            if (!schedule) {
                return;
            }

            const object3d = this.getDieGraphic(schedule.dieId);
            let startScreenX = canvas.clientWidth / 2;
            let startScreenY = canvas.clientHeight / 2;

            if (object3d) {
                object3d.getWorldPosition(this.worldPosition);
                this.worldPosition.x += schedule.offsetX;
                this.worldPosition.y += TOKEN_Y_OFFSET;
                this.worldPosition.project(camera);
                startScreenX = (this.worldPosition.x * 0.5 + 0.5) * canvas.clientWidth;
                startScreenY = (-this.worldPosition.y * 0.5 + 0.5) * canvas.clientHeight;
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
                startScreenX,
                startScreenY,
                bumpTriggered: false,
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
        const overlayRect = this.overlayRoot.getBoundingClientRect();

        for (const [tokenId, token] of this.activeTokens) {
            const lifeProgress = Math.min(Math.max((nowMs - token.spawnedAtMs) / TOKEN_VISIBLE_MS, 0), 1);

            let screenX = token.startScreenX;
            let screenY = token.startScreenY;

            const label = this.labels.get(token.dieId);
            const labelRect = label?.element.getBoundingClientRect() ?? null;

            if (labelRect) {
                const targetX = labelRect.left + labelRect.width / 2 - overlayRect.left;
                const targetY = labelRect.top + labelRect.height / 2 - overlayRect.top;
                const eased = lifeProgress * lifeProgress * (3 - 2 * lifeProgress);
                screenX = token.startScreenX + (targetX - token.startScreenX) * eased;
                screenY = token.startScreenY + (targetY - token.startScreenY) * eased;
            }

            token.element.style.left = `${screenX}px`;
            token.element.style.top = `${screenY}px`;

            if (!token.bumpTriggered && lifeProgress >= BUMP_TRIGGER_PROGRESS) {
                token.bumpTriggered = true;

                if (label) {
                    label.currentValue += 1;
                    label.element.textContent = `${resourceIcons[ResourceNames.highScore]} ${label.currentValue}`;
                    label.element.classList.remove('is-bumping');
                    void label.element.offsetWidth;
                    label.element.classList.add('is-bumping');
                }
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
