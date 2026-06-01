import { type CapabilityCanvasContext, type GlazeLayerOptions } from './CapabilityTypes';
import { withAlpha } from './CapabilityUtils';

export function applyGlazeLayer(context2d: CapabilityCanvasContext, options: GlazeLayerOptions): void {
    const context = context2d.context;
    const width = context2d.width;
    const height = context2d.height;

    const glazeGradient = context.createLinearGradient(0, 0, 0, height);
    const glazeColor = options.color ?? 'rgb(255, 255, 255)';
    glazeGradient.addColorStop(0, withAlpha(glazeColor, options.alpha));
    glazeGradient.addColorStop(0.45, withAlpha(glazeColor, options.alpha * 0.15));
    glazeGradient.addColorStop(1, withAlpha(glazeColor, 0));
    context.fillStyle = glazeGradient as unknown as string;
    context.fillRect(0, 0, width, height);

    const poolingAlpha = options.poolingAlpha ?? 0;
    if (poolingAlpha <= 0) {
        return;
    }

    const poolingColor = options.poolingColor ?? 'rgb(0, 0, 0)';
    context.fillStyle = withAlpha(poolingColor, poolingAlpha);
    context.fillRect(0, Math.round(height * 0.82), width, Math.round(height * 0.18));
}
