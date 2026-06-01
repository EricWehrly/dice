import * as THREE from 'three';
import { type CapabilityCanvasContext, type CapabilityTextureResult } from './CapabilityTypes';

export function createAtlasCanvasContext(faceSize: number): CapabilityCanvasContext {
    const canvas = document.createElement('canvas');
    const gap = Math.max(4, Math.round(faceSize * 0.05));
    canvas.width = (3 * faceSize) + (4 * gap);
    canvas.height = (2 * faceSize) + (3 * gap);

    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Failed to create 2D canvas context for capability rendering');
    }

    return {
        canvas,
        context,
        width: canvas.width,
        height: canvas.height,
    };
}

export function toNoColorSpaceTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
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

export function createNoColorSpaceTextureResult(faceSize: number, fillStyle: string): CapabilityTextureResult {
    const atlas = createAtlasCanvasContext(faceSize);
    atlas.context.fillStyle = fillStyle;
    atlas.context.fillRect(0, 0, atlas.width, atlas.height);
    return {
        texture: toNoColorSpaceTexture(atlas.canvas),
        canvas: atlas.canvas,
    };
}

export function clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
}

export function withAlpha(color: string, alpha: number): string {
    if (color.includes('rgba(')) {
        return color;
    }

    if (color.includes('rgb(')) {
        const values = color.replace('rgb(', '').replace(')', '');
        return `rgba(${values}, ${alpha.toFixed(3)})`;
    }

    if (color.startsWith('#')) {
        const normalized = color.length === 4
            ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
            : color;
        const r = parseInt(normalized.slice(1, 3), 16);
        const g = parseInt(normalized.slice(3, 5), 16);
        const b = parseInt(normalized.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
    }

    return color;
}