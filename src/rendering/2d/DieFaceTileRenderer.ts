export interface DieFaceTileColors {
    fill: string;
    stroke: string;
    text: string;
}

export interface DieFaceTileOptions {
    x: number;
    y: number;
    size: number;
    value: string;
    colors: DieFaceTileColors;
    lineWidth?: number;
    font?: string;
    alpha?: number;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetY?: number;
}

/**
 * Shared 2D die face tile drawing for both the roll screen and modification panel.
 */
export function drawDieFaceTile(context: CanvasRenderingContext2D, options: DieFaceTileOptions): void {
    const {
        x,
        y,
        size,
        value,
        colors,
        lineWidth = 2,
        font = '600 20px "Trebuchet MS", sans-serif',
        alpha = 1,
        shadowColor = 'transparent',
        shadowBlur = 0,
        shadowOffsetY = 0,
    } = options;

    context.save();
    context.globalAlpha = alpha;
    context.shadowColor = shadowColor;
    context.shadowBlur = shadowBlur;
    context.shadowOffsetY = shadowOffsetY;

    context.fillStyle = colors.fill;
    context.strokeStyle = colors.stroke;
    context.lineWidth = lineWidth;
    context.fillRect(x, y, size, size);
    context.strokeRect(x, y, size, size);

    context.shadowColor = 'transparent';
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;

    context.fillStyle = colors.text;
    context.font = font;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(value, x + size / 2, y + size / 2);
    context.restore();
}
