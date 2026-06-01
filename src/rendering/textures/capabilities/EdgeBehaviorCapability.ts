import { type CapabilityCanvasContext, type EdgeBehaviorOptions } from './CapabilityTypes';
import { withAlpha } from './CapabilityUtils';

export function applyEdgeBehavior(context2d: CapabilityCanvasContext, options: EdgeBehaviorOptions): void {
    const context = context2d.context;
    const width = context2d.width;
    const height = context2d.height;
    const edgeSize = Math.max(2, Math.round(Math.min(width, height) * (options.sizeRatio ?? 0.012)));

    context.fillStyle = withAlpha(options.brightColor, options.alpha);
    context.fillRect(0, 0, width, edgeSize);
    context.fillRect(0, 0, edgeSize, height);

    if (!options.darkColor) {
        return;
    }

    context.fillStyle = withAlpha(options.darkColor, options.alpha * 0.85);
    context.fillRect(0, height - edgeSize, width, edgeSize);
    context.fillRect(width - edgeSize, 0, edgeSize, height);
}
