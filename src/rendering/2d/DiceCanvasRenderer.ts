import Events from '../../../engine/js/events';
import { TrickEvents } from '../../game/contracts/TrickContracts';
import { Bag, type BagRolledEvent } from '../../game/Bag';
import { Die } from '../../game/Die';
import { drawDieFaceTile } from './DieFaceTileRenderer';

interface EquippedDiceProvider {
    getEquippedDice(): Die[];
}

function isEquippedDiceProvider(bag: Bag): bag is Bag & EquippedDiceProvider {
    return typeof (bag as Bag & Partial<EquippedDiceProvider>).getEquippedDice === 'function';
}

export class DiceCanvasRenderer {
    private static readonly TILE_SIZE = 80;
    private static readonly GAP = 16;
    private static readonly GLOW_DURATION_MS = 1800;
    private static readonly GLOW_DELAY_MS = 120;

    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    private readonly bag: Bag;
    private readonly onResize: () => void;
    private readonly onCanvasClick: (event: MouseEvent) => void;
    private readonly glowingDiceIds: Set<string> = new Set();
    private glowStartTime: number = 0;
    private lastRollDiceIds: string[] = [];
    private animationFrameId: number | null = null;

    constructor(bag: Bag) {
        const canvas = document.getElementById('dice-canvas') as HTMLCanvasElement | null;
        if (!canvas) {
            throw new Error(`Canvas element '#dice-canvas' not found`);
        }

        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('2D canvas context unavailable');
        }

        this.canvas = canvas;
        this.context = context;
        this.bag = bag;
        this.onResize = () => {
            this.resize();
            this.render();
        };
        this.onCanvasClick = (event: MouseEvent) => {
            this.handleCanvasClick(event);
        };

        this.resize();
        window.addEventListener('resize', this.onResize);
        this.canvas.addEventListener('click', this.onCanvasClick);

        Events.Subscribe<BagRolledEvent>(TrickEvents.BAG_ROLLED, (event) => {
            this.lastRollDiceIds = event.diceIds;
            this.render();
        });
        Events.Subscribe(TrickEvents.BAG_CHANGED, () => this.render());
        Events.Subscribe(TrickEvents.TRICK_DISCOVERED, () => this.startDiceGlow());
        Events.Subscribe(TrickEvents.TRICK_HIGH_SCORE, () => this.startDiceGlow());

        this.render();
    }

    private startDiceGlow(): void {
        this.glowingDiceIds.clear();
        for (const dieId of this.lastRollDiceIds) {
            this.glowingDiceIds.add(dieId);
        }
        this.glowStartTime = performance.now();
        this.scheduleAnimationFrame();
    }

    private scheduleAnimationFrame(): void {
        if (this.animationFrameId !== null) {
            return;
        }
        this.animationFrameId = requestAnimationFrame(() => {
            this.animationFrameId = null;
            this.render();
            if (this.glowingDiceIds.size > 0) {
                const elapsed = performance.now() - this.glowStartTime;
                if (elapsed < DiceCanvasRenderer.GLOW_DURATION_MS + DiceCanvasRenderer.GLOW_DELAY_MS) {
                    this.scheduleAnimationFrame();
                } else {
                    this.glowingDiceIds.clear();
                }
            }
        });
    }

    render(): void {
        const canvasColor = this.getThemeColor('--color-canvas-bg');
        const feltShadowColor = this.getThemeColor('--color-canvas-felt-shadow');
        const trimColor = this.getThemeColor('--color-gold-trim-soft');
        const dieFaceColor = this.getThemeColor('--color-die-face-bg');
        const dieStrokeColor = this.getThemeColor('--color-die-face-border');
        const dieTextColor = this.getThemeColor('--color-die-face-text');
        const dieLabelColor = this.getThemeColor('--color-die-label-text');

        if (!canvasColor || !trimColor || !dieFaceColor || !dieStrokeColor || !dieTextColor || !dieLabelColor) {
            console.warn('Missing theme colors, cannot render dice canvas');
            return;
        }

        this.clear(canvasColor, trimColor);

        const { TILE_SIZE: tileSize, GAP: gap } = DiceCanvasRenderer;
        const rowStride = tileSize + gap;
        const perRow = this.getTilesPerRow();

        const diceToRender = this.getDisplayDice();

        diceToRender.forEach((die, index) => {
            const col = index % perRow;
            const row = Math.floor(index / perRow);
            const x = gap + col * (tileSize + gap);
            const y = gap + row * rowStride;

            // Die tile (using shared renderer)
            drawDieFaceTile(this.context, {
                x,
                y,
                die,
                size: tileSize,
                colors: {
                    fill: dieFaceColor,
                    stroke: die.locked ? (trimColor ?? dieStrokeColor) : dieStrokeColor,
                    text: dieTextColor,
                },
            });

            // Die label
            this.context.font = '500 12px "Trebuchet MS", sans-serif';
            this.context.fillStyle = dieLabelColor;
            this.context.textAlign = 'center';
            this.context.textBaseline = 'top';
            this.context.fillText(die.name, x + tileSize / 2, y + tileSize + 4);

            // Reset context state after shared tile renderer
            this.context.globalAlpha = 1;
            this.context.shadowColor = 'transparent';
            this.context.shadowBlur = 0;
            this.context.shadowOffsetY = 0;
        });

        this.drawDiceGlows();
        this.context.globalAlpha = 1;
    }

    private drawDiceGlows(): void {
        if (this.glowingDiceIds.size === 0) {
            return;
        }

        const elapsed = performance.now() - this.glowStartTime;
        const delayPhase = Math.max(0, DiceCanvasRenderer.GLOW_DELAY_MS - elapsed);
        if (delayPhase > 0) {
            return;
        }

        const animationElapsed = elapsed - DiceCanvasRenderer.GLOW_DELAY_MS;
        const glowProgress = Math.min(1, animationElapsed / DiceCanvasRenderer.GLOW_DURATION_MS);

        const peakAt = 0.18;
        let glowIntensity: number;
        if (glowProgress < peakAt) {
            glowIntensity = glowProgress / peakAt;
        } else {
            glowIntensity = 1 - (glowProgress - peakAt) / (1 - peakAt);
        }

        const { TILE_SIZE: tileSize, GAP: gap } = DiceCanvasRenderer;
        const rowStride = tileSize + gap;
        const perRow = this.getTilesPerRow();

        this.getDisplayDice().forEach((die, index) => {
            if (!this.glowingDiceIds.has(die.id)) {
                return;
            }

            const col = index % perRow;
            const row = Math.floor(index / perRow);
            const x = gap + col * (tileSize + gap);
            const y = gap + row * rowStride;

            const glowColor = `rgba(255, 216, 139, ${0.55 * glowIntensity})`;
            const glowSize = 4;

            this.context.save();
            this.context.strokeStyle = glowColor;
            this.context.lineWidth = 3;
            this.context.shadowColor = glowColor;
            this.context.shadowBlur = glowSize * glowIntensity;
            this.context.shadowOffsetX = 0;
            this.context.shadowOffsetY = 0;
            this.context.strokeRect(x - 1, y - 1, tileSize + 2, tileSize + 2);
            this.context.restore();
        });
    }

    private getTilesPerRow(): number {
        const availableWidth = this.canvas.clientWidth || 900;
        return Math.max(1, Math.floor((availableWidth - DiceCanvasRenderer.GAP) / (DiceCanvasRenderer.TILE_SIZE + DiceCanvasRenderer.GAP)));
    }

    private handleCanvasClick(event: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const die = this.getDieAtPoint(x, y);
        if (!die) {
            return;
        }

        this.bag.toggleLocked(die.id);
    }

    private getDieAtPoint(x: number, y: number) {
        const { TILE_SIZE: tileSize, GAP: gap } = DiceCanvasRenderer;
        const rowStride = tileSize + gap;
        const perRow = this.getTilesPerRow();

        for (const [index, die] of this.getDisplayDice().entries()) {
            const col = index % perRow;
            const row = Math.floor(index / perRow);
            const tileX = gap + col * (tileSize + gap);
            const tileY = gap + row * rowStride;

            if (x >= tileX && x <= tileX + tileSize && y >= tileY && y <= tileY + tileSize) {
                return die;
            }
        }

        return null;
    }

    private getDisplayDice(): Die[] {
        return isEquippedDiceProvider(this.bag) ? this.bag.getEquippedDice() : this.bag.dice;
    }

    private resize(): void {
        const dpr = window.devicePixelRatio || 1;
        const logicalWidth = this.canvas.clientWidth || 900;
        const logicalHeight = this.canvas.clientHeight || 520;
        this.canvas.width = Math.floor(logicalWidth * dpr);
        this.canvas.height = Math.floor(logicalHeight * dpr);
        this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    private clear(canvasColor: string, trimColor: string): void {
        const width = this.canvas.clientWidth || 900;
        const height = this.canvas.clientHeight || 520;

        this.context.fillStyle = canvasColor;
        this.context.fillRect(0, 0, width, height);

        this.renderEdgeFalloff(width, height);

        this.context.strokeStyle = trimColor;
        this.context.lineWidth = 2;
        this.context.strokeRect(1, 1, Math.max(0, width - 2), Math.max(0, height - 2));
    }

    private renderEdgeFalloff(width: number, height: number): void {
        const edgeFalloff = this.context.createRadialGradient(
            width * 0.5,
            height * 0.5,
            Math.min(width, height) * 0.5,
            width * 0.5,
            height * 0.5,
            Math.max(width, height) * 0.9,
        );
        edgeFalloff.addColorStop(0, 'rgba(0, 0, 0, 0)');
        edgeFalloff.addColorStop(1, 'rgba(0, 0, 0, 0.08)');
        this.context.fillStyle = edgeFalloff;
        this.context.fillRect(0, 0, width, height);
    }

    private getThemeColor(name: string): string | null {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return value || null;
    }
}
