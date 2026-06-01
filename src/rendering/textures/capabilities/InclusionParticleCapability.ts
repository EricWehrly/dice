import { type CapabilityCanvasContext, type InclusionParticleOptions } from './CapabilityTypes';
import { withAlpha } from './CapabilityUtils';

export function applyInclusionParticles(context2d: CapabilityCanvasContext, options: InclusionParticleOptions): void {
    const context = context2d.context;
    const width = context2d.width;
    const height = context2d.height;

    const particleCount = Math.round(((width * height) / 2200) * options.densityScale);
    const minSize = options.minSize ?? 1;
    const maxSize = options.maxSize ?? 2;
    context.fillStyle = withAlpha(options.color, options.alpha);

    for (let index = 0; index < particleCount; index += 1) {
        const x = Math.floor((Math.sin(index * 17.11) * 0.5 + 0.5) * width);
        const y = Math.floor((Math.cos(index * 11.73) * 0.5 + 0.5) * height);
        const size = minSize + (index % Math.max(1, (maxSize - minSize + 1)));
        context.fillRect(x, y, size, size);
    }
}
