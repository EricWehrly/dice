import * as THREE from 'three';
import { type DieBodyMaterial, type DieSurfaceFinish } from './DieTextureTypes';
import { MaterialTextureRegistry } from './MaterialTextureRegistry';
import { type RenderPipStyle } from '../../game/PipStyle';

export interface DieFaceTextureOptions {
    readonly faceSize?: number;
    readonly backgroundColor: string;
    readonly pipColor: string;
    readonly edgeRoundness?: number;
    readonly pipStyle?: RenderPipStyle;
    readonly pipSize?: number;
}

export interface D6AtlasMaterialOptions extends DieFaceTextureOptions {
    readonly geometry: THREE.BoxGeometry;
}

/**
 * Options for texture generation using the material registry.
 * 
 * Includes material and finish information to allow material-specific
 * texture generators to provide appropriate textures.
 */
export interface D6AtlasMaterialWithGeneratorOptions extends D6AtlasMaterialOptions {
    readonly bodyMaterial?: DieBodyMaterial;
    readonly surfaceFinish?: DieSurfaceFinish;
}

export interface D6SurfaceDetailTextureOptions extends D6AtlasMaterialOptions {
    readonly surfaceFinish?: DieSurfaceFinish;
    readonly kind: 'bump' | 'roughness';
}

const DEFAULT_FACE_SIZE = 256;
const DEFAULT_EDGE_ROUNDNESS = 0.32;
const ATLAS_COLUMNS = 3;
const ATLAS_ROWS = 2;
const ATLAS_GAP_RATIO = 0.05;
const D6_FACE_ORDER = [3, 4, 1, 6, 2, 5] as const;
// % of face size to place (center of) pip
// so left is 24%, and so on
const PIP_GRID_POSITIONS = {
    left: 0.24,
    center: 0.5,
    right: 0.76,
    top: 0.24,
    middle: 0.5,
    bottom: 0.76,
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
    const edgeRoundness = clamp(options.edgeRoundness ?? DEFAULT_EDGE_ROUNDNESS, 0, 0.5);
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
        drawFaceBackground(context, x, y, faceSize, options.backgroundColor, edgeRoundness);
        drawFacePips(
            context,
            x,
            y,
            faceSize,
            faceValue,
            options.pipColor,
            options.backgroundColor,
            options.pipStyle ?? 'circle',
            options.pipSize ?? 1,
        );
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.NoColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
}

export function createD6FaceAtlasMaterialTexture(input: D6AtlasMaterialWithGeneratorOptions): THREE.CanvasTexture {
    const faceSize = input.faceSize ?? DEFAULT_FACE_SIZE;
    applyD6AtlasUvs(input.geometry, faceSize);
    
    // Check if a material texture generator is registered for this material
    const generatorMaterial = input.bodyMaterial ?? 'plastic';
    const generator = MaterialTextureRegistry.get(generatorMaterial);
    
    if (generator) {
        return generator.generateTexture({
            backgroundColor: input.backgroundColor,
            pipColor: input.pipColor,
            surfaceFinish: input.surfaceFinish ?? 'plain',
            faceSize,
            edgeRoundness: input.edgeRoundness,
            pipStyle: input.pipStyle,
            pipSize: input.pipSize,
        });
    }
    
    // Fallback: no generator registered for this material, so render with flat palette colors.
    // This is an intentional permanent backstop — F14 explicitly requires it to stay so
    // new materials can be added to the registry incrementally without visual breakage.
    // See: docs/features/F14-material-authoring-plan.md — "Maintain fallback to color-only rendering when no generator exists"
    return createD6FaceAtlasTexture({
        backgroundColor: input.backgroundColor,
        pipColor: input.pipColor,
        faceSize,
        edgeRoundness: input.edgeRoundness,
        pipStyle: input.pipStyle,
        pipSize: input.pipSize,
    });
}

export function createD6FaceSurfaceDetailTexture(input: D6SurfaceDetailTextureOptions): THREE.CanvasTexture {
    const faceSize = input.faceSize ?? DEFAULT_FACE_SIZE;
    applyD6AtlasUvs(input.geometry, faceSize);

    const gap = Math.max(4, Math.round(faceSize * ATLAS_GAP_RATIO));
    const atlasWidth = (ATLAS_COLUMNS * faceSize) + ((ATLAS_COLUMNS + 1) * gap);
    const atlasHeight = (ATLAS_ROWS * faceSize) + ((ATLAS_ROWS + 1) * gap);

    const canvas = document.createElement('canvas');
    canvas.width = atlasWidth;
    canvas.height = atlasHeight;

    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Failed to create 2D canvas context for die face surface detail texture');
    }

    const profile = resolveSurfaceDetailProfile(input.surfaceFinish, input.kind);

    context.clearRect(0, 0, atlasWidth, atlasHeight);
    context.fillStyle = profile.atlasBase;
    context.fillRect(0, 0, atlasWidth, atlasHeight);

    D6_FACE_ORDER.forEach((faceValue, index) => {
        const column = index % ATLAS_COLUMNS;
        const row = Math.floor(index / ATLAS_COLUMNS);
        const x = gap + column * (faceSize + gap);
        const y = gap + row * (faceSize + gap);

        drawFaceBackground(context, x, y, faceSize, profile.faceBase, 0);
        drawFacePips(
            context,
            x,
            y,
            faceSize,
            faceValue,
            profile.pipValue,
            profile.faceBase,
            input.pipStyle ?? 'circle',
            input.pipSize ?? 1,
        );
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

function resolveSurfaceDetailProfile(
    surfaceFinish: DieSurfaceFinish | undefined,
    kind: 'bump' | 'roughness',
): { atlasBase: string; faceBase: string; pipValue: string } {
    if (kind === 'bump') {
        switch (surfaceFinish ?? 'plain') {
            case 'etched':
                return { atlasBase: '#585858', faceBase: '#707070', pipValue: '#dedede' };
            case 'polished':
                return { atlasBase: '#6a6a6a', faceBase: '#7a7a7a', pipValue: '#d4d4d4' };
            case 'hammered':
                return { atlasBase: '#4f4f4f', faceBase: '#666666', pipValue: '#d8d8d8' };
            case 'plain':
            default:
                return { atlasBase: '#5f5f5f', faceBase: '#747474', pipValue: '#dadada' };
        }
    }

    // Roughness map convention: white = rough, black = smooth
    switch (surfaceFinish ?? 'plain') {
        case 'etched':
            return { atlasBase: '#808080', faceBase: '#b3b3b3', pipValue: '#666666' };
        case 'polished':
            return { atlasBase: '#595959', faceBase: '#6e6e6e', pipValue: '#3b3b3b' };
        case 'hammered':
            return { atlasBase: '#8f8f8f', faceBase: '#c2c2c2', pipValue: '#7a7a7a' };
        case 'plain':
        default:
            return { atlasBase: '#6e6e6e', faceBase: '#9c9c9c', pipValue: '#525252' };
    }
}

function applyD6AtlasUvs(geometry: THREE.BoxGeometry, faceSize: number): void {
    const gap = Math.max(4, Math.round(faceSize * ATLAS_GAP_RATIO));
    const atlasWidth = (ATLAS_COLUMNS * faceSize) + ((ATLAS_COLUMNS + 1) * gap);
    const atlasHeight = (ATLAS_ROWS * faceSize) + ((ATLAS_ROWS + 1) * gap);
    const uvAttribute = geometry.getAttribute('uv');
    const positionAttribute = geometry.getAttribute('position');

    if (!uvAttribute || !positionAttribute) {
        throw new Error('BoxGeometry is missing UVs required for the d6 atlas');
    }

    const uv = uvAttribute as THREE.BufferAttribute;
    const baseUv = getOrInitBaseUv(geometry, uv);
    const tileRect = (index: number) => {
        const column = index % ATLAS_COLUMNS;
        const row = Math.floor(index / ATLAS_COLUMNS);
        return {
            x: gap + column * (faceSize + gap),
            y: gap + row * (faceSize + gap),
        };
    };

    const positions = positionAttribute.array as ArrayLike<number>;
    const verticesPerFace = positions.length / (D6_FACE_ORDER.length * 3);

    if (!Number.isFinite(verticesPerFace) || verticesPerFace <= 0) {
        throw new Error('Unable to remap d6 atlas UVs for rounded box geometry');
    }

    for (let vertexIndex = 0; vertexIndex < uv.count; vertexIndex += 1) {
        const faceIndex = Math.min(
            D6_FACE_ORDER.length - 1,
            Math.floor(vertexIndex / verticesPerFace),
        );
        const rect = tileRect(faceIndex);
        const existingU = baseUv[(vertexIndex * 2) + 0];
        const existingV = baseUv[(vertexIndex * 2) + 1];

        uv.setXY(
            vertexIndex,
            (rect.x + existingU * faceSize) / atlasWidth,
            (rect.y + existingV * faceSize) / atlasHeight,
        );
    }

    uv.needsUpdate = true;
}

function drawFaceBackground(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    faceSize: number,
    backgroundColor: string,
    edgeRoundness: number,
): void {
    context.clearRect(x, y, faceSize, faceSize);
    context.fillStyle = backgroundColor;
    context.fillRect(x, y, faceSize, faceSize);
    // Edge rounding is now handled by mesh geometry (chamfered box), not texture.
}

function drawFacePips(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    faceSize: number,
    faceValue: number,
    pipColor: string,
    backgroundColor: string,
    pipStyle: RenderPipStyle,
    pipSize: number,
): void {
    const normalizedPipSize = Number.isFinite(pipSize) && pipSize >= 0 ? pipSize : 0;
    if (normalizedPipSize === 0) {
        return;
    }

    const pipRadius = faceSize * 0.062 * normalizedPipSize;
    const highlightColor = mixHexColors(pipColor, '#ffffff', 0.35);

    context.fillStyle = pipColor;
    context.shadowColor = 'rgba(0, 0, 0, 0.28)';
    context.shadowBlur = faceSize * 0.018;
    context.shadowOffsetY = faceSize * 0.008;

    for (const [normalizedX, normalizedY] of D6_PIP_LAYOUTS[faceValue]) {
        const centerX = x + (normalizedX * faceSize);
        const centerY = y + (normalizedY * faceSize);

        if (pipStyle === 'x') {
            drawCrossPip(context, centerX, centerY, pipRadius, pipColor);
        } else if (pipStyle === 'clover') {
            drawCloverPip(context, centerX, centerY, pipRadius, pipColor);
        } else if (pipStyle === 'lock') {
            drawLockPip(context, centerX, centerY, pipRadius, pipColor, backgroundColor);
        } else {
            drawCirclePip(context, centerX, centerY, pipRadius, pipColor, highlightColor);
        }
    }

    context.shadowColor = 'transparent';
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;
}

function drawCrossPip(
    context: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    pipRadius: number,
    pipColor: string,
): void {
    const arm = pipRadius * 0.9;
    context.lineWidth = Math.max(1, pipRadius * 0.65);
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(centerX - arm, centerY - arm);
    context.lineTo(centerX + arm, centerY + arm);
    context.moveTo(centerX + arm, centerY - arm);
    context.lineTo(centerX - arm, centerY + arm);
    context.strokeStyle = pipColor;
    context.stroke();
}

function drawCirclePip(
    context: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    pipRadius: number,
    pipColor: string,
    highlightColor: string,
): void {
    context.beginPath();
    context.arc(centerX, centerY, pipRadius, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = highlightColor;
    context.beginPath();
    context.arc(centerX - pipRadius * 0.22, centerY - pipRadius * 0.22, pipRadius * 0.34, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = pipColor;
}

function drawCloverPip(
    context: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    pipRadius: number,
    pipColor: string,
): void {
    context.fillStyle = pipColor;
    const leafSize = pipRadius * 1.02;
    drawCloverLeaf(context, centerX, centerY, -0.72, -0.72, leafSize);
    drawCloverLeaf(context, centerX, centerY, 0.72, -0.72, leafSize);
    drawCloverLeaf(context, centerX, centerY, -0.72, 0.72, leafSize);
    drawCloverLeaf(context, centerX, centerY, 0.72, 0.72, leafSize);

    context.beginPath();
    context.arc(centerX, centerY, Math.max(1, pipRadius * 0.2), 0, Math.PI * 2);
    context.fill();

    if (pipRadius >= 6) {
        const stemW = Math.max(1, pipRadius * 0.14);
        const stemTop = centerY + (leafSize * 0.42);
        const stemH = pipRadius * 0.34;
        context.fillRect(centerX - stemW / 2, stemTop, stemW, stemH);
    }
}

function drawCloverLeaf(
    context: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    dirX: number,
    dirY: number,
    leafSize: number,
): void {
    const length = Math.hypot(dirX, dirY) || 1;
    const nx = dirX / length;
    const ny = dirY / length;
    const px = -ny;
    const py = nx;

    const point = (along: number, across: number): [number, number] => [
        centerX + (nx * along + px * across) * leafSize,
        centerY + (ny * along + py * across) * leafSize,
    ];

    // Clover style spectrum knobs:
    // cartoonBias: lower = botanical, higher = shamrock-cartoon.
    // notchNarrowness: lower = broad heart notch, higher = tight/narrow notch.
    // Keep these near each other so art tuning can happen in one spot.
    const cartoonBias = 0.8;
    const notchNarrowness = 0.85;
    const [baseX, baseY] = point(0.07, 0);
    const [leftShoulderX, leftShoulderY] = point(0.34, 0.44 + (0.08 * cartoonBias));
    const [leftTipX, leftTipY] = point(0.76 + (0.04 * cartoonBias), 0.22 + (0.06 * cartoonBias));
    const [tipNotchX, tipNotchY] = point(0.60 + (0.08 * cartoonBias), 0);
    const [rightTipX, rightTipY] = point(0.76 + (0.04 * cartoonBias), -0.22 - (0.06 * cartoonBias));
    const [rightShoulderX, rightShoulderY] = point(0.34, -0.44 - (0.08 * cartoonBias));
    const [leftNotchCtrlX, leftNotchCtrlY] = point(
        0.88 + (0.06 * cartoonBias),
        (0.08 + (0.05 * cartoonBias)) * (1 - (0.7 * notchNarrowness)),
    );
    const [rightNotchCtrlX, rightNotchCtrlY] = point(
        0.88 + (0.06 * cartoonBias),
        (-0.08 - (0.05 * cartoonBias)) * (1 - (0.7 * notchNarrowness)),
    );

    context.beginPath();
    context.moveTo(baseX, baseY);
    context.quadraticCurveTo(leftShoulderX, leftShoulderY, leftTipX, leftTipY);
    context.quadraticCurveTo(leftNotchCtrlX, leftNotchCtrlY, tipNotchX, tipNotchY);
    context.quadraticCurveTo(rightNotchCtrlX, rightNotchCtrlY, rightTipX, rightTipY);
    context.quadraticCurveTo(rightShoulderX, rightShoulderY, baseX, baseY);
    context.fill();
}

function drawLockPip(
    context: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    pipRadius: number,
    pipColor: string,
    backgroundColor: string,
): void {
    context.fillStyle = pipColor;
    const bodyW = pipRadius * 1.45;
    const bodyH = pipRadius * 1.15;
    const bodyX = centerX - bodyW / 2;
    const bodyY = centerY - pipRadius * 0.02;

    context.fillRect(bodyX, bodyY, bodyW, bodyH);

    context.strokeStyle = pipColor;
    context.lineWidth = Math.max(1, pipRadius * 0.22);
    context.beginPath();
    context.arc(centerX, bodyY, pipRadius * 0.55, Math.PI, 0);
    context.stroke();

    const keyholeR = Math.max(1, pipRadius * 0.16);
    context.fillStyle = backgroundColor;
    context.beginPath();
    context.arc(centerX, bodyY + bodyH * 0.45, keyholeR, 0, Math.PI * 2);
    context.fill();
    context.fillRect(centerX - keyholeR * 0.45, bodyY + bodyH * 0.45, keyholeR * 0.9, keyholeR * 1.2);
    context.fillStyle = pipColor;
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

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function getOrInitBaseUv(geometry: THREE.BoxGeometry, uv: THREE.BufferAttribute): Float32Array {
    const userData = geometry.userData as { d6BaseUv?: Float32Array };
    if (!userData.d6BaseUv || userData.d6BaseUv.length !== uv.array.length) {
        userData.d6BaseUv = new Float32Array(uv.array as ArrayLike<number>);
    }

    return userData.d6BaseUv;
}