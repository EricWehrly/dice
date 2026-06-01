import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clamp01, withAlpha } from '../../../rendering/textures/capabilities/CapabilityUtils';
import { createRoughnessAuthorityMap } from '../../../rendering/textures/capabilities/RoughnessAuthorityCapability';
import { applyMicroGrain } from '../../../rendering/textures/capabilities/MicroGrainCapability';
import { applyMacroBreakup } from '../../../rendering/textures/capabilities/MacroBreakupCapability';
import { applyEdgeBehavior } from '../../../rendering/textures/capabilities/EdgeBehaviorCapability';
import { applyGlazeLayer } from '../../../rendering/textures/capabilities/GlazeLayerCapability';
import { applyDepthAttenuation } from '../../../rendering/textures/capabilities/DepthAttenuationCapability';
import { applyVeinMask } from '../../../rendering/textures/capabilities/VeinMaskCapability';
import { applyInclusionParticles } from '../../../rendering/textures/capabilities/InclusionParticleCapability';
import type { CapabilityCanvasContext } from '../../../rendering/textures/capabilities/CapabilityTypes';

const mockGradient = { addColorStop: vi.fn() };

const mockContext = {
    fillStyle: '' as unknown,
    strokeStyle: '',
    lineWidth: 0,
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    createLinearGradient: vi.fn(() => ({ ...mockGradient })),
    createRadialGradient: vi.fn(() => ({ ...mockGradient })),
};

if (typeof HTMLCanvasElement !== 'undefined') {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
        configurable: true,
        value: (contextId: string) => {
            if (contextId === '2d') return mockContext as unknown as CanvasRenderingContext2D;
            return null;
        },
    });
}

function makeCapabilityContext(width = 64, height = 64): CapabilityCanvasContext {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
    return { canvas, context, width, height };
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe('clamp01', () => {
    it('clamps values below 0 to 0', () => {
        expect(clamp01(-1)).toBe(0);
        expect(clamp01(-0.001)).toBe(0);
    });

    it('clamps values above 1 to 1', () => {
        expect(clamp01(2)).toBe(1);
        expect(clamp01(1.001)).toBe(1);
    });

    it('passes through values in [0, 1]', () => {
        expect(clamp01(0)).toBe(0);
        expect(clamp01(0.5)).toBe(0.5);
        expect(clamp01(1)).toBe(1);
    });
});

describe('withAlpha', () => {
    it('converts rgb() to rgba() with given alpha', () => {
        const result = withAlpha('rgb(255, 128, 0)', 0.5);
        expect(result).toContain('rgba(');
        expect(result).toContain('0.500');
    });

    it('converts 6-digit hex to rgba()', () => {
        const result = withAlpha('#ff0000', 0.25);
        expect(result).toMatch(/rgba\(255,\s*0,\s*0,\s*0\.250\)/);
    });

    it('converts 3-digit hex to rgba()', () => {
        const result = withAlpha('#f00', 0.5);
        expect(result).toMatch(/rgba\(255,\s*0,\s*0,\s*0\.500\)/);
    });

    it('returns existing rgba() unchanged', () => {
        const input = 'rgba(100, 200, 50, 0.8)';
        expect(withAlpha(input, 0.1)).toBe(input);
    });

    it('returns unknown format unchanged', () => {
        expect(withAlpha('hsl(0,0%,50%)', 0.5)).toBe('hsl(0,0%,50%)');
    });
});

describe('createRoughnessAuthorityMap', () => {
    it('returns a texture object', () => {
        const texture = createRoughnessAuthorityMap({ roughness: 0.5, faceSize: 32 });
        expect(texture).toBeDefined();
    });

    it('does not throw for roughness 0 or 1', () => {
        expect(() => createRoughnessAuthorityMap({ roughness: 0, faceSize: 32 })).not.toThrow();
        expect(() => createRoughnessAuthorityMap({ roughness: 1, faceSize: 32 })).not.toThrow();
    });

    it('does not throw for out-of-range roughness values', () => {
        expect(() => createRoughnessAuthorityMap({ roughness: -0.5, faceSize: 32 })).not.toThrow();
        expect(() => createRoughnessAuthorityMap({ roughness: 1.5, faceSize: 32 })).not.toThrow();
    });

    it('draws grain lines when grainAlpha > 0', () => {
        createRoughnessAuthorityMap({ roughness: 0.5, faceSize: 32, grainAlpha: 0.1, grainStep: 4 });
        expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('skips grain drawing when grainAlpha is 0', () => {
        createRoughnessAuthorityMap({ roughness: 0.5, faceSize: 32, grainAlpha: 0, grainStep: 4 });
        expect(mockContext.stroke).not.toHaveBeenCalled();
    });
});

describe('applyMicroGrain', () => {
    it('draws strokes for horizontal direction', () => {
        applyMicroGrain(makeCapabilityContext(), { color: 'rgb(0,0,0)', alpha: 0.5, step: 4, direction: 'horizontal' });
        expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('draws strokes for vertical direction', () => {
        applyMicroGrain(makeCapabilityContext(), { color: 'rgb(0,0,0)', alpha: 0.5, step: 4, direction: 'vertical' });
        expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('draws strokes for diagonal direction', () => {
        applyMicroGrain(makeCapabilityContext(), { color: 'rgb(0,0,0)', alpha: 0.5, step: 4, direction: 'diagonal' });
        expect(mockContext.stroke).toHaveBeenCalled();
    });
});

describe('applyMacroBreakup', () => {
    it('calls fillRect for horizontal bands', () => {
        applyMacroBreakup(makeCapabilityContext(), { brightColor: 'rgb(255,255,255)', alpha: 0.5, bandStep: 8, direction: 'horizontal' });
        expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('calls fillRect for vertical bands', () => {
        applyMacroBreakup(makeCapabilityContext(), { brightColor: 'rgb(255,255,255)', alpha: 0.5, bandStep: 8, direction: 'vertical' });
        expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('calls fillRect for diagonal bands', () => {
        applyMacroBreakup(makeCapabilityContext(), { brightColor: 'rgb(255,255,255)', alpha: 0.5, bandStep: 8, direction: 'diagonal' });
        expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('draws dark pass when darkColor is provided', () => {
        applyMacroBreakup(makeCapabilityContext(), {
            brightColor: 'rgb(255,255,255)',
            darkColor: 'rgb(0,0,0)',
            alpha: 0.5,
            bandStep: 8,
            direction: 'horizontal',
        });
        const calls = mockContext.fillRect.mock.calls.length;
        expect(calls).toBeGreaterThan(1);
    });
});

describe('applyEdgeBehavior', () => {
    it('fills top and left edge regions', () => {
        applyEdgeBehavior(makeCapabilityContext(64, 64), { brightColor: 'rgb(255,255,255)', alpha: 0.5, sizeRatio: 0.1 });
        const calls = mockContext.fillRect.mock.calls;
        const topEdge = calls.find(([x, y, w]: number[]) => x === 0 && y === 0 && w === 64);
        expect(topEdge).toBeDefined();
    });

    it('fills bottom and right edge regions when darkColor is provided', () => {
        applyEdgeBehavior(makeCapabilityContext(64, 64), {
            brightColor: 'rgb(255,255,255)',
            darkColor: 'rgb(0,0,0)',
            alpha: 0.5,
        });
        expect(mockContext.fillRect.mock.calls.length).toBeGreaterThanOrEqual(4);
    });
});

describe('applyGlazeLayer', () => {
    it('creates a linear gradient', () => {
        applyGlazeLayer(makeCapabilityContext(), { alpha: 0.3 });
        expect(mockContext.createLinearGradient).toHaveBeenCalled();
    });

    it('fills the canvas', () => {
        applyGlazeLayer(makeCapabilityContext(), { alpha: 0.3 });
        expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('draws pooling rect when poolingAlpha > 0', () => {
        applyGlazeLayer(makeCapabilityContext(), { alpha: 0.3, poolingAlpha: 0.2 });
        expect(mockContext.fillRect.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
});

describe('applyDepthAttenuation', () => {
    it('creates a radial gradient', () => {
        applyDepthAttenuation(makeCapabilityContext(), { centerColor: 'rgb(240,240,240)', edgeColor: 'rgb(40,40,40)', alpha: 0.2 });
        expect(mockContext.createRadialGradient).toHaveBeenCalled();
    });

    it('fills the canvas', () => {
        applyDepthAttenuation(makeCapabilityContext(), { centerColor: 'rgb(240,240,240)', edgeColor: 'rgb(40,40,40)', alpha: 0.2 });
        expect(mockContext.fillRect).toHaveBeenCalled();
    });
});

describe('applyVeinMask', () => {
    it('draws lines', () => {
        applyVeinMask(makeCapabilityContext(), { color: 'rgb(255,255,255)', alpha: 0.5, veinCount: 3, amplitude: 10 });
        expect(mockContext.stroke).toHaveBeenCalled();
    });
});

describe('applyInclusionParticles', () => {
    it('does not throw with zero density', () => {
        expect(() => applyInclusionParticles(makeCapabilityContext(), {
            color: 'rgb(255,255,255)',
            alpha: 0.5,
            densityScale: 0,
        })).not.toThrow();
    });

    it('calls fillRect when densityScale > 0', () => {
        applyInclusionParticles(makeCapabilityContext(), {
            color: 'rgb(200,200,200)',
            alpha: 0.5,
            densityScale: 1,
        });
        expect(mockContext.fillRect).toHaveBeenCalled();
    });
});

