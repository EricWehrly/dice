import Events from '../../../engine/js/events';
import { TrickEvents } from '../../game/contracts/TrickContracts';
import { Bag } from '../../game/Bag';

export class DiceCanvasRenderer {
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    private readonly bag: Bag;
    private readonly onResize: () => void;

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

        this.resize();
        window.addEventListener('resize', this.onResize);

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

        const tileSize = 80;
        const gap = 16;
        const availableWidth = this.canvas.clientWidth || 900;
        const perRow = Math.max(1, Math.floor((availableWidth - gap) / (tileSize + gap)));

        this.bag.dice.forEach((die, index) => {
            const col = index % perRow;
            const row = Math.floor(index / perRow);
            const x = gap + col * (tileSize + gap);
            const y = gap + row * (tileSize + gap);

            this.context.globalAlpha = die.active ? 1 : 0.4;
            this.context.shadowColor = 'rgba(14, 8, 24, 0.36)';
            this.context.shadowBlur = 8;
            this.context.shadowOffsetY = 3;
            this.context.fillStyle = dieFaceColor;
            this.context.fillRect(x, y, tileSize, tileSize);
            this.context.strokeStyle = dieStrokeColor;
            this.context.lineWidth = 2;
            this.context.strokeRect(x, y, tileSize, tileSize);

            this.context.shadowColor = 'transparent';
            this.context.shadowBlur = 0;
            this.context.shadowOffsetY = 0;

            this.context.fillStyle = dieTextColor;
            this.context.font = '600 32px "Trebuchet MS", sans-serif';
            this.context.textAlign = 'center';
            this.context.textBaseline = 'middle';
            this.context.fillText(String(die.faceUp), x + tileSize / 2, y + tileSize / 2);

            this.context.font = '500 12px "Trebuchet MS", sans-serif';
            this.context.fillStyle = dieLabelColor;
            this.context.fillText(die.label, x + tileSize / 2, y + tileSize + 10);
        });

        this.context.globalAlpha = 1;
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
