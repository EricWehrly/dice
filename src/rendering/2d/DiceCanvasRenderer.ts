import Events from '../../../engine/js/events';
import { TrickEvents } from '../../game/contracts/TrickContracts';
import { Bag } from '../../game/Bag';
import { drawDieFaceTile } from './DieFaceTileRenderer';

export class DiceCanvasRenderer {
    private static readonly TILE_SIZE = 80;
    private static readonly GAP = 16;
    private static readonly LABEL_HEIGHT = 18;
    private static readonly LOCK_BTN_HEIGHT = 22;
    private static readonly LOCK_BTN_MARGIN = 4;

    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    private readonly bag: Bag;
    private readonly onResize: () => void;
    private readonly onCanvasClick: (event: MouseEvent) => void;

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

        Events.Subscribe(TrickEvents.BAG_ROLLED, () => this.render());
        Events.Subscribe(TrickEvents.BAG_CHANGED, () => this.render());

        this.render();
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

        const { TILE_SIZE: tileSize, GAP: gap, LABEL_HEIGHT: labelHeight, LOCK_BTN_HEIGHT: btnHeight, LOCK_BTN_MARGIN: btnMargin } = DiceCanvasRenderer;
        const rowStride = tileSize + labelHeight + btnMargin + btnHeight + gap;
        const perRow = this.getTilesPerRow();

        this.bag.dice.forEach((die, index) => {
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
            this.context.textBaseline = 'top';
            this.context.fillText(die.label, x + tileSize / 2, y + tileSize + 4);

            // Reset context state after shared tile renderer
            this.context.globalAlpha = 1;
            this.context.shadowColor = 'transparent';
            this.context.shadowBlur = 0;
            this.context.shadowOffsetY = 0;

            // Lock button
            const btnY = y + tileSize + labelHeight + btnMargin;
            if (die.locked) {
                this.context.fillStyle = trimColor ?? '#c9a94a';
                this.context.strokeStyle = trimColor ?? '#c9a94a';
            } else {
                this.context.fillStyle = 'rgba(255,255,255,0.06)';
                this.context.strokeStyle = dieStrokeColor;
            }
            this.context.lineWidth = 1.5;
            this.context.beginPath();
            this.context.roundRect(x + 4, btnY, tileSize - 8, btnHeight, 4);
            this.context.fill();
            this.context.stroke();

            this.context.fillStyle = die.locked ? '#1a0d2e' : dieLabelColor;
            this.context.font = `700 11px "Trebuchet MS", sans-serif`;
            this.context.textAlign = 'center';
            this.context.textBaseline = 'middle';
            this.context.fillText(die.locked ? 'UNLOCK' : 'LOCK', x + tileSize / 2, btnY + btnHeight / 2);
        });

        this.context.globalAlpha = 1;
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
        const { TILE_SIZE: tileSize, GAP: gap, LABEL_HEIGHT: labelHeight, LOCK_BTN_HEIGHT: btnHeight, LOCK_BTN_MARGIN: btnMargin } = DiceCanvasRenderer;
        const rowStride = tileSize + labelHeight + btnMargin + btnHeight + gap;
        const perRow = this.getTilesPerRow();

        for (const [index, die] of this.bag.dice.entries()) {
            const col = index % perRow;
            const row = Math.floor(index / perRow);
            const tileX = gap + col * (tileSize + gap);
            const tileY = gap + row * rowStride;
            const btnY = tileY + tileSize + labelHeight + btnMargin;

            const btnLeft = tileX + 4;
            const btnRight = tileX + tileSize - 4;

            if (x >= btnLeft && x <= btnRight && y >= btnY && y <= btnY + btnHeight) {
                return die;
            }
        }

        return null;
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
