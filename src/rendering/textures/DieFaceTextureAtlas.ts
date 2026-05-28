import * as THREE from 'three';

export interface DieFaceTextureOptions {
    readonly faceSize?: number;
    readonly backgroundColor: string;
    readonly pipColor: string;
}

export interface D6AtlasMaterialOptions extends DieFaceTextureOptions {
    readonly geometry: THREE.BoxGeometry;
}

const DEFAULT_FACE_SIZE = 256;
const ATLAS_COLUMNS = 3;
const ATLAS_ROWS = 2;
const ATLAS_GAP_RATIO = 0.05;
const D6_FACE_ORDER = [3, 4, 1, 6, 2, 5] as const;
const PIP_GRID_POSITIONS = {
    left: 0.28,
    center: 0.5,
    right: 0.72,
    top: 0.28,
    middle: 0.5,
    bottom: 0.72,
} as const;

const D6_PIP_LAYOUTS: Record<number, ReadonlyArray<readonly [number, number]>> = {
    1: [[PIP_GRID_POSITIONS.center, PIP_GRID_POSITIONS.middle]],
    2: [
        [PIP_GRID_POSITIONS.left, PIP_GRID_POSITIONS.top],
        [PIP_GRID_POSITIONS.right, PIP_GRID_POSITIONS.bottom],
    ],
    3: [
        [PIP_GRID_POSITIONS.left, PIP_GRID_POSITIONS.top],
        [PIP_GRID_POSITIONS.center, PIP_GRID_POSITIONS.middle],
        [PIP_GRID_POSITIONS.right, PIP_GRID_POSITIONS.bottom],
    ],
    4: [
        [PIP_GRID_POSITIONS.left, PIP_GRID_POSITIONS.top],
        [PIP_GRID_POSITIONS.right, PIP_GRID_POSITIONS.top],
        [PIP_GRID_POSITIONS.left, PIP_GRID_POSITIONS.bottom],
        [PIP_GRID_POSITIONS.right, PIP_GRID_POSITIONS.bottom],
    ],
    5: [
        [PIP_GRID_POSITIONS.left, PIP_GRID_POSITIONS.top],
        [PIP_GRID_POSITIONS.right, PIP_GRID_POSITIONS.top],
        [PIP_GRID_POSITIONS.center, PIP_GRID_POSITIONS.middle],
        [PIP_GRID_POSITIONS.left, PIP_GRID_POSITIONS.bottom],
        [PIP_GRID_POSITIONS.right, PIP_GRID_POSITIONS.bottom],
    ],
    6: [
        [PIP_GRID_POSITIONS.left, PIP_GRID_POSITIONS.top],
        [PIP_GRID_POSITIONS.right, PIP_GRID_POSITIONS.top],
        [PIP_GRID_POSITIONS.left, PIP_GRID_POSITIONS.middle],
        [PIP_GRID_POSITIONS.right, PIP_GRID_POSITIONS.middle],
        [PIP_GRID_POSITIONS.left, PIP_GRID_POSITIONS.bottom],
        [PIP_GRID_POSITIONS.right, PIP_GRID_POSITIONS.bottom],
    ],
};

export function createD6FaceAtlasTexture(options: DieFaceTextureOptions): THREE.CanvasTexture {
    const faceSize = options.faceSize ?? DEFAULT_FACE_SIZE;
    const gap = Math.max(4, Math.round(faceSize * ATLAS_GAP_RATIO));
    const atlasWidth = (ATLAS_COLUMNS * faceSize) + ((ATLAS_COLUMNS + 1) * gap);
    const atlasHeight = (ATLAS_ROWS * faceSize) + ((ATLAS_ROWS + 1) * gap);

    const canvas = document.createElement('canvas');
    canvas.width = atlasWidth;
    canvas.height = atlasHeight;

    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Failed to create 2D canvas context for die face texture atlas');
    }

    context.clearRect(0, 0, atlasWidth, atlasHeight);
    context.fillStyle = options.backgroundColor;
    context.fillRect(0, 0, atlasWidth, atlasHeight);

    D6_FACE_ORDER.forEach((faceValue, index) => {
        const column = index % ATLAS_COLUMNS;
        const row = Math.floor(index / ATLAS_COLUMNS);
        const x = gap + column * (faceSize + gap);
        const y = gap + row * (faceSize + gap);
        drawFaceBackground(context, x, y, faceSize, options.backgroundColor);
        drawFacePips(context, x, y, faceSize, faceValue, options.pipColor);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
}

export function createD6FaceAtlasMaterialTexture(input: D6AtlasMaterialOptions): THREE.CanvasTexture {
    const faceSize = input.faceSize ?? DEFAULT_FACE_SIZE;
    applyD6AtlasUvs(input.geometry, faceSize);
    return createD6FaceAtlasTexture({
        backgroundColor: input.backgroundColor,
        pipColor: input.pipColor,
        faceSize,
    });
}

function applyD6AtlasUvs(geometry: THREE.BoxGeometry, faceSize: number): void {
    const gap = Math.max(4, Math.round(faceSize * ATLAS_GAP_RATIO));
    const atlasWidth = (ATLAS_COLUMNS * faceSize) + ((ATLAS_COLUMNS + 1) * gap);
    const atlasHeight = (ATLAS_ROWS * faceSize) + ((ATLAS_ROWS + 1) * gap);
    const uvAttribute = geometry.getAttribute('uv');

    if (!uvAttribute) {
        throw new Error('BoxGeometry is missing UVs required for the d6 atlas');
    }

    const uv = uvAttribute as THREE.BufferAttribute;
    const tileRect = (index: number) => {
        const column = index % ATLAS_COLUMNS;
        const row = Math.floor(index / ATLAS_COLUMNS);
        return {
            x: gap + column * (faceSize + gap),
            y: gap + row * (faceSize + gap),
        };
    };

    for (let faceIndex = 0; faceIndex < D6_FACE_ORDER.length; faceIndex += 1) {
        const rect = tileRect(faceIndex);
        for (let vertexIndex = 0; vertexIndex < 4; vertexIndex += 1) {
            const uvIndex = (faceIndex * 4) + vertexIndex;
            const existingU = uv.getX(uvIndex);
            const existingV = uv.getY(uvIndex);
            uv.setXY(
                uvIndex,
                (rect.x + existingU * faceSize) / atlasWidth,
                (rect.y + existingV * faceSize) / atlasHeight,
            );
        }
    }

    uv.needsUpdate = true;
}

function drawFaceBackground(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    faceSize: number,
    backgroundColor: string,
): void {
    context.clearRect(x, y, faceSize, faceSize);
    context.fillStyle = backgroundColor;
    context.fillRect(x, y, faceSize, faceSize);

    const borderWidth = faceSize * 0.04;
    context.strokeStyle = mixHexColors(backgroundColor, '#000000', 0.22);
    context.lineWidth = borderWidth;
    context.strokeRect(x + (borderWidth / 2), y + (borderWidth / 2), faceSize - borderWidth, faceSize - borderWidth);
}

function drawFacePips(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    faceSize: number,
    faceValue: number,
    pipColor: string,
): void {
    const pipRadius = faceSize * 0.085;
    const highlightColor = mixHexColors(pipColor, '#ffffff', 0.35);

    context.fillStyle = pipColor;
    context.shadowColor = 'rgba(0, 0, 0, 0.28)';
    context.shadowBlur = faceSize * 0.03;
    context.shadowOffsetY = faceSize * 0.012;

    for (const [normalizedX, normalizedY] of D6_PIP_LAYOUTS[faceValue]) {
        const centerX = x + (normalizedX * faceSize);
        const centerY = y + (normalizedY * faceSize);

        context.beginPath();
        context.arc(centerX, centerY, pipRadius, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = highlightColor;
        context.beginPath();
        context.arc(centerX - pipRadius * 0.22, centerY - pipRadius * 0.22, pipRadius * 0.34, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = pipColor;
    }

    context.shadowColor = 'transparent';
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;
}

function mixHexColors(colorA: string, colorB: string, ratio: number): string {
    const [redA, greenA, blueA] = parseHexColor(colorA);
    const [redB, greenB, blueB] = parseHexColor(colorB);

    const mixChannel = (first: number, second: number): string => {
        const mixed = Math.round(first * (1 - ratio) + second * ratio);
        return mixed.toString(16).padStart(2, '0');
    };

    return `#${mixChannel(redA, redB)}${mixChannel(greenA, greenB)}${mixChannel(blueA, blueB)}`;
}

function parseHexColor(color: string): [number, number, number] {
    const normalized = color.startsWith('#') ? color.slice(1) : color;
    if (normalized.length !== 6) {
        throw new Error(`Unsupported hex color format: ${color}`);
    }

    return [
        parseInt(normalized.slice(0, 2), 16),
        parseInt(normalized.slice(2, 4), 16),
        parseInt(normalized.slice(4, 6), 16),
    ];
}