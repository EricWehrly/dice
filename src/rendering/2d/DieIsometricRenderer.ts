/**
 * DieIsometricRenderer
 * 
 * 2D canvas-based isometric die renderer for the die modification panel.
 * Renders a die in isometric projection showing ~3 visible faces with style details.
 * 
 * Used in both collapsed mode (visual feedback) and for design reference.
 */

export interface IsometricDieRenderInput {
    /** Root DOM element containing the canvas */
    root: HTMLElement;
    /** Number of faces on the die (6 for standard cube) */
    faceCount: number;
    /** Currently selected core mod (for indicator placement) */
    currentCoreMod: string | null;
    /** Face index where core mod is currently installed (null if none) */
    coreModInstalledOnFace: number | null;
    /** Die style (material/finish affecting appearance) */
    style: 'plain' | 'etched' | 'polished' | 'hammered';
}

export interface IsometricPoint {
    x: number;
    y: number;
}

interface Point3D {
    x: number;
    y: number;
    z: number;
}

type FaceId = 'top' | 'right' | 'front';

/**
 * Converts 3D cube coordinates to 2D isometric projection.
 * 
 * Isometric uses 30-60 degree angles with equal scaling on all axes.
 * This creates the classic isometric look where the die appears to be tilted
 * showing the top-right-front corner.
 * 
 * @param x Position on x-axis (-1 to 1)
 * @param y Position on y-axis (-1 to 1) 
 * @param z Position on z-axis (-1 to 1)
 * @param scale Scaling factor for the projection
 * @param offsetX Horizontal offset in 2D space
 * @param offsetY Vertical offset in 2D space
 * @returns 2D isometric coordinates
 */
function project3DToIsometric(
    x: number,
    y: number,
    z: number,
    scale: number = 60,
    offsetX: number = 0,
    offsetY: number = 0
): IsometricPoint {
    // Classic isometric projection (30 degree axes)
    const isoX = (x - y) * Math.cos(Math.PI / 6) * scale;
    const isoY = (x + y) * Math.sin(Math.PI / 6) * scale - z * scale;
    
    return {
        x: isoX + offsetX,
        y: isoY + offsetY,
    };
}

/**
 * Builds shared cube face vertices in 3D, so all faces align on common edges.
 */
export function buildFaceVertices(size: number): Record<FaceId, Point3D[]> {
    const h = size / 2;

    return {
        top: [
            { x: -h, y: -h, z: h },
            { x: h, y: -h, z: h },
            { x: h, y: h, z: h },
            { x: -h, y: h, z: h },
        ],
        right: [
            { x: h, y: -h, z: h },
            { x: h, y: h, z: h },
            { x: h, y: h, z: -h },
            { x: h, y: -h, z: -h },
        ],
        front: [
            { x: -h, y: h, z: h },
            { x: h, y: h, z: h },
            { x: h, y: h, z: -h },
            { x: -h, y: h, z: -h },
        ],
    };
}

export function projectFace(face: Point3D[], scale: number, offsetX: number, offsetY: number): IsometricPoint[] {
    return face.map((point) => project3DToIsometric(point.x, point.y, point.z, scale, offsetX, offsetY));
}

/**
 * Draws a die face with pips based on face number.
 * Standard d6 numbering: 1-6, with opposite faces summing to 7.
 * 
 * @param ctx Canvas rendering context
 * @param corners 4-point array defining the parallelogram
 * @param faceNumber Which face (1-6) - determines pip pattern
 * @param style Die finish style affecting appearance
 */
function drawFaceWithPips(
    ctx: CanvasRenderingContext2D,
    corners: IsometricPoint[],
    corners3d: Point3D[],
    faceNumber: number,
    faceId: FaceId,
    scale: number,
    offsetX: number,
    offsetY: number,
    style: 'plain' | 'etched' | 'polished' | 'hammered'
): void {
    // Draw face background
    ctx.fillStyle = getStyleColor(style, faceId);
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    ctx.lineTo(corners[1].x, corners[1].y);
    ctx.lineTo(corners[2].x, corners[2].y);
    ctx.lineTo(corners[3].x, corners[3].y);
    ctx.closePath();
    ctx.fill();

    // Draw face border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = faceId === 'front' ? 1.4 : 1;
    ctx.stroke();

    drawPipsForFace(ctx, corners3d, faceNumber, scale, offsetX, offsetY);
}

/**
 * Gets the base color for a face based on material/finish style.
 */
function getStyleColor(style: 'plain' | 'etched' | 'polished' | 'hammered', faceId: FaceId): string {
    let base: string;
    switch (style) {
        case 'plain':
            base = '#f5f5dc'; // Beige
            break;
        case 'etched':
            base = '#deb887'; // Burlywood
            break;
        case 'polished':
            base = '#fffacd'; // Lemon chiffon
            break;
        case 'hammered':
            base = '#c9a961'; // Darker brass
            break;
        default:
            base = '#f5f5dc';
    }

    // Subtle per-face shading improves cube depth readability.
    if (faceId === 'top') {
        return mixColor(base, '#ffffff', 0.16);
    }
    if (faceId === 'right') {
        return mixColor(base, '#000000', 0.08);
    }
    return mixColor(base, '#000000', 0.14);
}

function mixColor(hexA: string, hexB: string, t: number): string {
    const a = hexA.replace('#', '');
    const b = hexB.replace('#', '');
    const ar = parseInt(a.slice(0, 2), 16);
    const ag = parseInt(a.slice(2, 4), 16);
    const ab = parseInt(a.slice(4, 6), 16);
    const br = parseInt(b.slice(0, 2), 16);
    const bg = parseInt(b.slice(2, 4), 16);
    const bb = parseInt(b.slice(4, 6), 16);

    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);

    return `rgb(${r}, ${g}, ${bl})`;
}

/**
 * Draws pip dots on a die face according to standard d6 patterns.
 * 
 * @param ctx Canvas rendering context
 * @param centerX X coordinate of face center
 * @param centerY Y coordinate of face center
 * @param faceNumber Die face value (1-6)
 */
function drawPipsForFace(
    ctx: CanvasRenderingContext2D,
    corners3d: Point3D[],
    faceNumber: number,
    scale: number,
    offsetX: number,
    offsetY: number
): void {
    const pipRadius = Math.max(2.4, Math.min(4, scale * 0.075));
    const spacing = 0.22;

    ctx.fillStyle = '#000';

    const pipPositions: Record<number, [number, number][]> = {
        1: [[0, 0]],
        2: [[-spacing, -spacing], [spacing, spacing]],
        3: [[-spacing, -spacing], [0, 0], [spacing, spacing]],
        4: [
            [-spacing, -spacing],
            [spacing, -spacing],
            [-spacing, spacing],
            [spacing, spacing],
        ],
        5: [
            [-spacing, -spacing],
            [spacing, -spacing],
            [0, 0],
            [-spacing, spacing],
            [spacing, spacing],
        ],
        6: [
            [-spacing, -spacing],
            [spacing, -spacing],
            [-spacing, 0],
            [spacing, 0],
            [-spacing, spacing],
            [spacing, spacing],
        ],
    };

    const positions = pipPositions[faceNumber] || pipPositions[1];
    const origin = corners3d[0];
    const u = {
        x: corners3d[1].x - corners3d[0].x,
        y: corners3d[1].y - corners3d[0].y,
        z: corners3d[1].z - corners3d[0].z,
    };
    const v = {
        x: corners3d[3].x - corners3d[0].x,
        y: corners3d[3].y - corners3d[0].y,
        z: corners3d[3].z - corners3d[0].z,
    };

    for (const [dx, dy] of positions) {
        const a = 0.5 + dx;
        const b = 0.5 + dy;

        const pip3D: Point3D = {
            x: origin.x + u.x * a + v.x * b,
            y: origin.y + u.y * a + v.y * b,
            z: origin.z + u.z * a + v.z * b,
        };

        const pip2D = project3DToIsometric(pip3D.x, pip3D.y, pip3D.z, scale, offsetX, offsetY);
        ctx.beginPath();
        ctx.arc(pip2D.x, pip2D.y, pipRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Draws an indicator on a specific face showing where a core mod is installed.
 * 
 * @param ctx Canvas rendering context
 * @param corners 4-point array defining the face parallelogram
 * @param installed Whether a mod is installed on this face
 */
function drawModIndicator(
    ctx: CanvasRenderingContext2D,
    corners: IsometricPoint[],
    installed: boolean
): void {
    if (!installed) {
        return;
    }

    // Draw a subtle highlight or badge
    const centerX = (corners[0].x + corners[1].x + corners[2].x + corners[3].x) / 4;
    const centerY = (corners[0].y + corners[1].y + corners[2].y + corners[3].y) / 4;

    ctx.fillStyle = 'rgba(255, 165, 0, 0.3)'; // Semi-transparent orange
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ff8c00';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw "M" label for "Mod"
    ctx.fillStyle = '#ff8c00';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('M', centerX, centerY);
}

function drawCenteredModIndicator(
    ctx: CanvasRenderingContext2D,
    topCorners: IsometricPoint[],
    rightCorners: IsometricPoint[],
    frontCorners: IsometricPoint[]
): void {
    const allCorners = [...topCorners, ...rightCorners, ...frontCorners];
    const centerX = allCorners.reduce((sum, point) => sum + point.x, 0) / allCorners.length;
    const centerY = allCorners.reduce((sum, point) => sum + point.y, 0) / allCorners.length;

    ctx.fillStyle = 'rgba(255, 165, 0, 0.22)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ff8c00';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ff8c00';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('M', centerX, centerY);
}

export class DieIsometricRenderer {
    /**
     * Renders an isometric die to a canvas within the provided root element.
     * 
     * @param input Configuration for the render
     */
    render(input: IsometricDieRenderInput): void {
        const canvas = input.root.querySelector('canvas#die-isometric-canvas') as HTMLCanvasElement | null;
        if (!canvas) {
            console.warn('DieIsometricRenderer: canvas#die-isometric-canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.warn('DieIsometricRenderer: Could not get canvas 2D context');
            return;
        }

        // Set canvas size
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = Math.max(1, Math.floor(rect.width || 200));
        const displayHeight = Math.max(1, Math.floor(rect.height || 105));
        canvas.width = Math.floor(displayWidth * dpr);
        canvas.height = Math.floor(displayHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Clear canvas with transparent background
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const faces3D = buildFaceVertices(1.5);
        const allVertices = [...faces3D.top, ...faces3D.right, ...faces3D.front];
        const unitProjected = allVertices.map((point) =>
            project3DToIsometric(point.x, point.y, point.z, 1, 0, 0)
        );

        const minX = Math.min(...unitProjected.map((point) => point.x));
        const maxX = Math.max(...unitProjected.map((point) => point.x));
        const minY = Math.min(...unitProjected.map((point) => point.y));
        const maxY = Math.max(...unitProjected.map((point) => point.y));
        const unitWidth = Math.max(1e-6, maxX - minX);
        const unitHeight = Math.max(1e-6, maxY - minY);

        // Fit vertically to fully use the viewport, while still honoring width bounds.
        const scaleY = displayHeight / unitHeight;
        const scaleX = displayWidth / unitWidth;
        const scale = Math.min(scaleY, scaleX);
        const offsetX = (displayWidth - unitWidth * scale) / 2 - minX * scale;
        const offsetY = -minY * scale;

        const projectedTop = projectFace(faces3D.top, scale, offsetX, offsetY);
        const projectedRight = projectFace(faces3D.right, scale, offsetX, offsetY);
        const projectedFront = projectFace(faces3D.front, scale, offsetX, offsetY);

        // Draw top and side faces first, then the front face so it sits in the foreground.
        drawFaceWithPips(ctx, projectedTop, faces3D.top, 1, 'top', scale, offsetX, offsetY, input.style);
        drawFaceWithPips(ctx, projectedRight, faces3D.right, 6, 'right', scale, offsetX, offsetY, input.style);
        drawFaceWithPips(ctx, projectedFront, faces3D.front, 3, 'front', scale, offsetX, offsetY, input.style);

        const hasCoreMod = input.currentCoreMod !== null || input.coreModInstalledOnFace !== null;
        if (!hasCoreMod) {
            return;
        }

        if (input.coreModInstalledOnFace === 0) {
            drawModIndicator(ctx, projectedTop, true);
            return;
        }
        if (input.coreModInstalledOnFace === 1) {
            drawModIndicator(ctx, projectedRight, true);
            return;
        }
        if (input.coreModInstalledOnFace === 2) {
            drawModIndicator(ctx, projectedFront, true);
            return;
        }

        drawCenteredModIndicator(ctx, projectedTop, projectedRight, projectedFront);
    }
}
