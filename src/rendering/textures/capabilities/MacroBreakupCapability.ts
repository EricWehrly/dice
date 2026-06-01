import { type CapabilityCanvasContext, type MacroBreakupOptions } from './CapabilityTypes';
import { withAlpha } from './CapabilityUtils';

export function applyMacroBreakup(context2d: CapabilityCanvasContext, options: MacroBreakupOptions): void {
    const context = context2d.context;
    const width = context2d.width;
    const height = context2d.height;

    context.fillStyle = withAlpha(options.brightColor, options.alpha);

    if (options.direction === 'horizontal') {
        for (let y = 0; y < height; y += options.bandStep) {
            context.fillRect(0, y, width, 1);
        }
    } else if (options.direction === 'vertical') {
        for (let x = 0; x < width; x += options.bandStep) {
            context.fillRect(x, 0, 1, height);
        }
    } else {
        for (let y = 0; y < height; y += 2) {
            const offset = Math.round((Math.sin(y * 0.04) + 1) * width * 0.06);
            for (let x = -offset; x < width; x += options.bandStep * 3) {
                context.fillRect(x + offset, y, Math.max(1, Math.round(options.bandStep * 0.8)), 1);
            }
        }
    }

    if (!options.darkColor) {
        return;
    }

    context.fillStyle = withAlpha(options.darkColor, options.alpha * 0.65);
    for (let x = 0; x < width; x += options.bandStep * 2) {
        context.fillRect(x, 0, 1, height);
    }
}
