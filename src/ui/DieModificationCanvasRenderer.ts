import { drawDieFaceTile } from '../rendering/2d/DieFaceTileRenderer';

export interface DieModificationCanvasRenderInput {
    root: HTMLElement;
    faceCount: number;
}

/**
 * Canvas-only renderer for the modification panel face strip.
 */
export class DieModificationCanvasRenderer {
    render(input: DieModificationCanvasRenderInput): void {
        const { root, faceCount } = input;

        const canvas = root.querySelector<HTMLCanvasElement>('#die-mod-canvas');
        if (!canvas) {
            return;
        }

        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }

        const dpr = window.devicePixelRatio || 1;
        const padding = 0;
        const columnWidth = 92;
        const tileSize = 44;
        const centerPosition = Math.floor(faceCount / 2);
        const width = padding * 2 + (faceCount + 1) * columnWidth;
        const height = padding * 2 + tileSize;

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, width, height);

        const tileBg = this.getThemeColor('--color-die-face-bg', '#f8f8f8');
        const tileBorder = this.getThemeColor('--color-die-face-border', '#999');
        const tileText = this.getThemeColor('--color-die-face-text', '#222');
        const coreAccent = this.getThemeColor('--color-gold-trim', '#d4af37');
        const coreGlow = this.getThemeColor('--color-gold-trim-soft', '#7f6b2d');
        const corePanelBg = this.getThemeColor('--color-counter-bg', '#111');

        for (let index = 0; index < faceCount; index += 1) {
            const displayIndex = index < centerPosition ? index : index + 1;
            const x = padding + displayIndex * columnWidth;
            const tileX = x + (columnWidth - tileSize) / 2;

            drawDieFaceTile(context, {
                x: tileX,
                y: padding,
                size: tileSize,
                value: String(index + 1),
                colors: {
                    fill: tileBg,
                    stroke: tileBorder,
                    text: tileText,
                },
            });
        }

        const coreX = padding + centerPosition * columnWidth;
        const coreTileX = coreX + (columnWidth - tileSize) / 2;

        drawDieFaceTile(context, {
            x: coreTileX,
            y: padding,
            size: tileSize,
            value: '',
            colors: {
                fill: corePanelBg,
                stroke: coreAccent,
                text: tileText,
            },
            alpha: 1,
        });

        context.save();
        context.strokeStyle = coreAccent;
        context.shadowColor = coreGlow;
        context.shadowBlur = 6;
        context.globalAlpha = 0.45;
        context.strokeRect(coreTileX, padding, tileSize, tileSize);
        context.restore();

        const innerSize = tileSize - 16;
        const innerX = coreTileX + (tileSize - innerSize) / 2;
        const innerY = padding + (tileSize - innerSize) / 2;
        context.strokeStyle = coreAccent;
        context.globalAlpha = 0.42;
        context.lineWidth = 1;
        context.strokeRect(innerX, innerY, innerSize, innerSize);
        context.globalAlpha = 1;
    }

    private getThemeColor(variableName: string, fallback: string): string {
        const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
        return value || fallback;
    }
}
