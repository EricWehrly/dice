export interface DieFaceTileColors {
    fill: string;
    stroke: string;
    text: string;
}

export interface DieDuckType {
    faceUp: number;
    active: boolean;
    locked: boolean;
}

export interface ShadowOptions {
    color?: string;
    blur?: number;
    offsetY?: number;
}

export interface DieFaceTileRenderInput {
    x: number;
    y: number;
    die: DieDuckType;
    colors: DieFaceTileColors;
    size?: number; // defaults to DEFAULT_TILE_SIZE (80)
    lineWidth?: number; // defaults to 3 if locked, 2 otherwise
    font?: string; // defaults to '600 32px "Trebuchet MS", sans-serif'
    shadowOptions?: ShadowOptions; // defaults to standard drop shadow
}

const DEFAULT_TILE_SIZE = 80;
const DEFAULT_SHADOW_COLOR = 'rgba(14, 8, 24, 0.36)';
const DEFAULT_SHADOW_BLUR = 8;
const DEFAULT_SHADOW_OFFSET_Y = 3;
const DEFAULT_FONT = '600 32px "Trebuchet MS", sans-serif';

/**
 * Shared 2D die face tile drawing for both the roll screen and modification panel.
 * Takes a die object (actual or duck-typed) and manages standard defaults for size,
 * styling, and appearance based on die state.
 */
export function drawDieFaceTile(context: CanvasRenderingContext2D, input: DieFaceTileRenderInput): void {
    const { x, y, die, colors } = input;
    const size = input.size ?? DEFAULT_TILE_SIZE;
    const lineWidth = input.lineWidth ?? (die.locked ? 3 : 2);
    const font = input.font ?? DEFAULT_FONT;
    const alpha = die.active ? 1 : 0.4;

    const shadowColor = input.shadowOptions?.color ?? DEFAULT_SHADOW_COLOR;
    const shadowBlur = input.shadowOptions?.blur ?? DEFAULT_SHADOW_BLUR;
    const shadowOffsetY = input.shadowOptions?.offsetY ?? DEFAULT_SHADOW_OFFSET_Y;

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
    context.fillText(String(die.faceUp), x + size / 2, y + size / 2);
    context.restore();
}
