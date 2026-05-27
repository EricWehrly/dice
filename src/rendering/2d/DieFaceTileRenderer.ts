export interface DieFaceTileColors {
    fill: string;
    stroke: string;
    text: string;
}

export type PipShape = 'circle' | 'square' | 'diamond' | 'hollow-circle' | 'star' | 'heart' | 'club' | 'clover' | 'skull';

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
    pipShape?: PipShape; // defaults to circle
    shadowOptions?: ShadowOptions; // defaults to standard drop shadow
}

const DEFAULT_TILE_SIZE = 80;
const DEFAULT_SHADOW_COLOR = 'rgba(14, 8, 24, 0.36)';
const DEFAULT_SHADOW_BLUR = 8;
const DEFAULT_SHADOW_OFFSET_Y = 3;
const DEFAULT_PIP_SHAPE: PipShape = 'circle';
const MAX_READABLE_PIPS = 9;

/**
 * Shared 2D die face tile drawing for both the roll screen and modification panel.
 * Takes a die object (actual or duck-typed) and manages standard defaults for size,
 * styling, and appearance based on die state.
 */
export function drawDieFaceTile(context: CanvasRenderingContext2D, input: DieFaceTileRenderInput): void {
    const { x, y, die, colors } = input;
    const size = input.size ?? DEFAULT_TILE_SIZE;
    const lineWidth = input.lineWidth ?? (die.locked ? 3 : 2);
    const alpha = die.active ? 1 : 0.4;
    const pipShape = input.pipShape ?? DEFAULT_PIP_SHAPE;
    const pipCount = Math.max(0, Math.floor(die.faceUp));

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
    if (pipCount > MAX_READABLE_PIPS) {
        drawFaceValueText(context, x, y, size, pipCount);
    } else {
        drawPips(context, x, y, size, pipCount, pipShape, colors);
    }
    context.restore();
}

function drawFaceValueText(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    value: number,
): void {
    const fontSize = Math.max(14, Math.round(size * 0.38));
    context.font = `700 ${fontSize}px "Trebuchet MS", sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(String(value), x + size / 2, y + size / 2);
}

function drawPips(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    pipCount: number,
    pipShape: PipShape,
    colors: DieFaceTileColors,
): void {
    if (pipCount <= 0) {
        return;
    }

    const inset = Math.max(6, size * 0.12);
    const drawableSize = size - inset * 2;
    const canonicalCenters = getCanonicalCenters(x, y, drawableSize, inset, pipCount);

    if (canonicalCenters) {
        const pipRadius = Math.max(1.8, Math.min(size * 0.1, drawableSize * 0.09));
        for (const [cx, cy] of canonicalCenters) {
            context.fillStyle = colors.text;
            drawPipShape(context, cx, cy, pipRadius, pipShape, colors);
        }
        return;
    }

    const columns = Math.ceil(Math.sqrt(pipCount));
    const rows = Math.ceil(pipCount / columns);
    const cellWidth = drawableSize / columns;
    const cellHeight = drawableSize / rows;
    const baseRadius = Math.min(cellWidth, cellHeight) * 0.22;
    const pipRadius = Math.max(1.8, Math.min(baseRadius, size * 0.11));

    for (let index = 0; index < pipCount; index += 1) {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const cx = x + inset + cellWidth * (col + 0.5);
        const cy = y + inset + cellHeight * (row + 0.5);

        context.fillStyle = colors.text;
        drawPipShape(context, cx, cy, pipRadius, pipShape, colors);
    }
}

type PipCenter = [number, number];

function getCanonicalCenters(
    x: number,
    y: number,
    drawableSize: number,
    inset: number,
    pipCount: number,
): PipCenter[] | null {
    if (pipCount < 1 || pipCount > 6) {
        return null;
    }

    const left = x + inset + drawableSize * 0.2;
    const centerX = x + inset + drawableSize * 0.5;
    const right = x + inset + drawableSize * 0.8;
    const top = y + inset + drawableSize * 0.2;
    const middleY = y + inset + drawableSize * 0.5;
    const bottom = y + inset + drawableSize * 0.8;

    const topLeft: PipCenter = [left, top];
    const topRight: PipCenter = [right, top];
    const center: PipCenter = [centerX, middleY];
    const bottomLeft: PipCenter = [left, bottom];
    const bottomRight: PipCenter = [right, bottom];
    const middleLeft: PipCenter = [left, middleY];
    const middleRight: PipCenter = [right, middleY];

    const canonicalByCount: Record<number, PipCenter[]> = {
        1: [center],
        2: [topLeft, bottomRight],
        3: [topLeft, center, bottomRight],
        4: [topLeft, topRight, bottomLeft, bottomRight],
        5: [topLeft, topRight, center, bottomLeft, bottomRight],
        6: [topLeft, middleLeft, bottomLeft, topRight, middleRight, bottomRight],
    };

    return canonicalByCount[pipCount] ?? null;
}

function drawPipShape(
    context: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    shape: PipShape,
    colors: DieFaceTileColors,
): void {
    switch (shape) {
        case 'square': {
            const side = radius * 2;
            context.fillRect(centerX - side / 2, centerY - side / 2, side, side);
            return;
        }
        case 'diamond': {
            context.beginPath();
            context.moveTo(centerX, centerY - radius);
            context.lineTo(centerX + radius, centerY);
            context.lineTo(centerX, centerY + radius);
            context.lineTo(centerX - radius, centerY);
            context.closePath();
            context.fill();
            return;
        }
        case 'hollow-circle': {
            context.lineWidth = Math.max(1, radius * 0.45);
            context.beginPath();
            context.arc(centerX, centerY, Math.max(1, radius * 0.8), 0, Math.PI * 2);
            context.stroke();
            return;
        }
        case 'star': {
            const outerR = radius;
            const innerR = radius * 0.42;
            context.beginPath();
            for (let i = 0; i < 5; i += 1) {
                const outerAngle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                const innerAngle = outerAngle + Math.PI / 5;
                const method = i === 0 ? 'moveTo' : 'lineTo';
                context[method](centerX + outerR * Math.cos(outerAngle), centerY + outerR * Math.sin(outerAngle));
                context.lineTo(centerX + innerR * Math.cos(innerAngle), centerY + innerR * Math.sin(innerAngle));
            }
            context.closePath();
            context.fill();
            return;
        }
        case 'heart': {
            context.beginPath();
            context.moveTo(centerX, centerY + radius * 0.8);
            context.bezierCurveTo(
                centerX - radius * 1.1, centerY + radius * 0.3,
                centerX - radius * 1.35, centerY - radius * 0.5,
                centerX, centerY - radius * 0.15,
            );
            context.bezierCurveTo(
                centerX + radius * 1.35, centerY - radius * 0.5,
                centerX + radius * 1.1, centerY + radius * 0.3,
                centerX, centerY + radius * 0.8,
            );
            context.fill();
            return;
        }
        case 'club': {
            const lobeR = radius * 0.44;
            const lobePositions: [number, number][] = [
                [centerX, centerY - lobeR * 0.72],
                [centerX - lobeR * 0.8, centerY + lobeR * 0.18],
                [centerX + lobeR * 0.8, centerY + lobeR * 0.18],
            ];
            for (const [lx, ly] of lobePositions) {
                context.beginPath();
                context.arc(lx, ly, lobeR, 0, Math.PI * 2);
                context.fill();
            }
            const stemW = radius * 0.22;
            const stemTop = centerY + lobeR * 0.72;
            const stemH = radius * 0.65;
            context.fillRect(centerX - stemW / 2, stemTop, stemW, stemH);
            context.fillRect(centerX - radius * 0.36, stemTop + stemH - radius * 0.18, radius * 0.72, radius * 0.18);
            return;
        }
        case 'clover': {
            const leafR = radius * 0.42;
            const leafOff = leafR * 0.8;
            const leafPositions: [number, number][] = [
                [centerX, centerY - leafOff],
                [centerX + leafOff, centerY],
                [centerX, centerY + leafOff],
                [centerX - leafOff, centerY],
            ];
            for (const [lx, ly] of leafPositions) {
                context.beginPath();
                context.arc(lx, ly, leafR, 0, Math.PI * 2);
                context.fill();
            }
            const stemW = radius * 0.2;
            const stemTop = centerY + leafOff + leafR * 0.3;
            context.fillRect(centerX - stemW / 2, stemTop, stemW, radius * 0.5);
            context.fillRect(centerX - radius * 0.32, stemTop + radius * 0.3, radius * 0.64, radius * 0.18);
            return;
        }
        case 'skull': {
            context.beginPath();
            context.arc(centerX, centerY - radius * 0.08, radius * 0.88, 0, Math.PI * 2);
            context.fill();
            context.fillStyle = colors.fill;
            const eyeR = radius * 0.21;
            context.beginPath();
            context.arc(centerX - radius * 0.3, centerY - radius * 0.18, eyeR, 0, Math.PI * 2);
            context.fill();
            context.beginPath();
            context.arc(centerX + radius * 0.3, centerY - radius * 0.18, eyeR, 0, Math.PI * 2);
            context.fill();
            context.fillStyle = colors.text;
            const toothW = radius * 0.17;
            const toothH = radius * 0.21;
            const teethY = centerY + radius * 0.55;
            for (let t = -1; t <= 1; t += 1) {
                context.fillRect(centerX + t * toothW * 1.25 - toothW / 2, teethY, toothW * 0.88, toothH);
            }
            return;
        }
        case 'circle':
        default: {
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, Math.PI * 2);
            context.fill();
        }
    }
}
