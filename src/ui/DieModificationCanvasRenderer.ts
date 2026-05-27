import { drawDieFaceTile } from '../rendering/2d/DieFaceTileRenderer';

export interface DieModificationCanvasRenderInput {
    root: HTMLElement;
    faceCount: number;
    selectedFaceIndex: number; // -1 = core, 0+ = face index
}

/**
 * Canvas-only renderer for the modification panel face strip.
 */
export class DieModificationCanvasRenderer {
    render(input: DieModificationCanvasRenderInput): void {
        const { root, faceCount, selectedFaceIndex } = input;

        const canvas = root.querySelector<HTMLCanvasElement>('#die-mod-canvas');
        if (!canvas) {
            return;
        }

        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }

        const dpr = window.devicePixelRatio || 1;
        const tileSize = 56;
        const tileGap = 8;
        const tilesPerView = 3;
        const padding = 6;
        const width = padding * 2 + tilesPerView * tileSize + (tilesPerView - 1) * tileGap;
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

        // Calculate prev, current, next indices (core=-1, faces=0..faceCount-1)
        const itemCount = faceCount + 1;
        const wrapIndex = (index: number): number => {
            const pos = ((index + 1) % itemCount + itemCount) % itemCount;
            return pos - 1;
        };

        const itemIndices = [
            wrapIndex(selectedFaceIndex - 1),
            selectedFaceIndex,
            wrapIndex(selectedFaceIndex + 1),
        ];

        itemIndices.forEach((itemIndex, position) => {
            const x = padding + position * (tileSize + tileGap);
            const opacity = position === 1 ? 1 : 0.55;
            context.globalAlpha = opacity;

            if (itemIndex === -1) {
                // Draw core tile
                drawDieFaceTile(context, {
                    x,
                    y: padding,
                    size: tileSize,
                    die: { faceUp: 0, active: true, locked: false },
                    colors: {
                        fill: corePanelBg,
                        stroke: coreAccent,
                        text: tileText,
                    },
                    shadowOptions: { color: 'transparent', blur: 0, offsetY: 0 },
                });
            } else {
                // Draw face tile
                drawDieFaceTile(context, {
                    x,
                    y: padding,
                    size: tileSize,
                    die: { faceUp: itemIndex + 1, active: true, locked: false },
                    colors: {
                        fill: tileBg,
                        stroke: tileBorder,
                        text: tileText,
                    },
                    shadowOptions: { color: 'transparent', blur: 0, offsetY: 0 },
                });
            }

            if (position === 1) {
                // Add glow to selected (center) item
                context.globalAlpha = 1;
                context.save();
                context.strokeStyle = coreAccent;
                context.shadowColor = coreGlow;
                context.shadowBlur = 8;
                context.lineWidth = 2;
                context.strokeRect(x - 2, padding - 2, tileSize + 4, tileSize + 4);
                context.restore();
            }
        });

        context.globalAlpha = 1;
    }

    private getThemeColor(variableName: string, fallback: string): string {
        const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
        return value || fallback;
    }
}
