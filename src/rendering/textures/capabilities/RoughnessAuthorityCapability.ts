import { type RoughnessAuthorityOptions } from './CapabilityTypes';
import { clamp01, createNoColorSpaceTextureResult, toNoColorSpaceTexture, withAlpha } from './CapabilityUtils';

export function createRoughnessAuthorityMap(options: RoughnessAuthorityOptions) {
    const roughness = clamp01(options.roughness);
    const grayscale = Math.round(roughness * 255);
    const result = createNoColorSpaceTextureResult(
        options.faceSize,
        `rgb(${grayscale}, ${grayscale}, ${grayscale})`,
    );

    const context = result.canvas.getContext('2d');
    if (!context) {
        return result.texture;
    }

    const grainAlpha = options.grainAlpha ?? 0;
    const grainStep = options.grainStep ?? 6;
    if (grainAlpha > 0) {
        context.strokeStyle = withAlpha('rgb(255, 255, 255)', grainAlpha);
        context.lineWidth = 1;
        for (let y = 0; y < result.canvas.height; y += grainStep) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(result.canvas.width, y);
            context.stroke();
        }
    }

    return toNoColorSpaceTexture(result.canvas);
}