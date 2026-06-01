import { type CapabilityCanvasContext, type MicroGrainOptions } from './CapabilityTypes';
import { withAlpha } from './CapabilityUtils';

export function applyMicroGrain(context2d: CapabilityCanvasContext, options: MicroGrainOptions): void {
    const intensityScale = options.intensityScale ?? 1;
    const alpha = options.alpha * intensityScale;
    const context = context2d.context;
    const width = context2d.width;
    const height = context2d.height;

    context.strokeStyle = withAlpha(options.color, alpha);
    context.lineWidth = 1;

    if (options.direction === 'horizontal') {
        for (let y = 0; y < height; y += options.step) {
            const wave = Math.sin(y * 0.09);
            const offset = wave * 2;
            context.beginPath();
            context.moveTo(0, y + offset);
            context.lineTo(width, y - (offset * 0.4));
            context.stroke();
        }
        return;
    }

    if (options.direction === 'vertical') {
        for (let x = 0; x < width; x += options.step) {
            const wave = Math.cos(x * 0.09);
            const offset = wave * 2;
            context.beginPath();
            context.moveTo(x + offset, 0);
            context.lineTo(x - (offset * 0.4), height);
            context.stroke();
        }
        return;
    }

    for (let y = 0; y < height; y += 1) {
        const diagonalOffset = Math.round((Math.sin(y * 0.045) + 1) * width * 0.08);
        for (let x = -diagonalOffset; x < width; x += options.step * 4) {
            context.beginPath();
            context.moveTo(x + diagonalOffset, y);
            context.lineTo(x + diagonalOffset + (options.step * 2), y);
            context.stroke();
        }
    }
}