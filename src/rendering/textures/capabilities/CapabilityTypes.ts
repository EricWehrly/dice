import * as THREE from 'three';

export interface CapabilityCanvasContext {
    readonly canvas: HTMLCanvasElement;
    readonly context: CanvasRenderingContext2D;
    readonly width: number;
    readonly height: number;
}

export interface RoughnessAuthorityOptions {
    readonly roughness: number;
    readonly faceSize: number;
    readonly grainAlpha?: number;
    readonly grainStep?: number;
}

export interface MicroGrainOptions {
    readonly color: string;
    readonly alpha: number;
    readonly step: number;
    readonly direction: 'horizontal' | 'diagonal' | 'vertical';
    readonly intensityScale?: number;
}

export interface MacroBreakupOptions {
    readonly brightColor: string;
    readonly darkColor?: string;
    readonly alpha: number;
    readonly bandStep: number;
    readonly direction: 'horizontal' | 'vertical' | 'diagonal';
}

export interface EdgeBehaviorOptions {
    readonly brightColor: string;
    readonly darkColor?: string;
    readonly alpha: number;
    readonly sizeRatio?: number;
}

export interface GlazeLayerOptions {
    readonly alpha: number;
    readonly poolingAlpha?: number;
    readonly color?: string;
    readonly poolingColor?: string;
}

export interface DepthAttenuationOptions {
    readonly centerColor: string;
    readonly edgeColor: string;
    readonly alpha: number;
    readonly radiusScale?: number;
}

export interface VeinMaskOptions {
    readonly color: string;
    readonly alpha: number;
    readonly veinCount: number;
    readonly amplitude: number;
}

export interface InclusionParticleOptions {
    readonly color: string;
    readonly alpha: number;
    readonly densityScale: number;
    readonly minSize?: number;
    readonly maxSize?: number;
}

export interface CapabilityTextureResult {
    readonly texture: THREE.CanvasTexture;
    readonly canvas: HTMLCanvasElement;
}