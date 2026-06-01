import { type CapabilityCanvasContext, type DepthAttenuationOptions } from './CapabilityTypes';
import { withAlpha } from './CapabilityUtils';

export function applyDepthAttenuation(context2d: CapabilityCanvasContext, options: DepthAttenuationOptions): void {
    const context = context2d.context;
    const width = context2d.width;
    const height = context2d.height;
    const radiusScale = options.radiusScale ?? 0.75;

    const gradient = context.createRadialGradient(
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.05,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * radiusScale,
    );

    gradient.addColorStop(0, withAlpha(options.centerColor, options.alpha * 0.45));
    gradient.addColorStop(0.6, withAlpha(options.centerColor, options.alpha * 0.16));
    gradient.addColorStop(1, withAlpha(options.edgeColor, options.alpha));

    context.fillStyle = gradient as unknown as string;
    context.fillRect(0, 0, width, height);
}
