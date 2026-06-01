import { type CapabilityCanvasContext, type VeinMaskOptions } from './CapabilityTypes';
import { withAlpha } from './CapabilityUtils';

export function applyVeinMask(context2d: CapabilityCanvasContext, options: VeinMaskOptions): void {
    const context = context2d.context;
    const width = context2d.width;
    const height = context2d.height;

    context.strokeStyle = withAlpha(options.color, options.alpha);
    context.lineWidth = 1;

    for (let index = 0; index < options.veinCount; index += 1) {
        const startY = Math.round((index / Math.max(1, options.veinCount - 1)) * height);
        context.beginPath();
        context.moveTo(0, startY);

        for (let x = 0; x <= width; x += Math.max(8, Math.round(width * 0.04))) {
            const wave = Math.sin((x * 0.03) + (index * 1.37));
            const y = startY + (wave * options.amplitude);
            context.lineTo(x, y);
        }

        context.stroke();
    }
}
