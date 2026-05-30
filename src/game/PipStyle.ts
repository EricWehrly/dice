export const RENDER_PIP_STYLES = ['circle', 'x'] as const;

export type RenderPipStyle = typeof RENDER_PIP_STYLES[number];
export type PipStyleSetting = '' | RenderPipStyle;

const RENDER_PIP_STYLE_SET = new Set<string>(RENDER_PIP_STYLES);

export function isRenderPipStyle(value: unknown): value is RenderPipStyle {
    return typeof value === 'string' && RENDER_PIP_STYLE_SET.has(value);
}

export function normalizeRenderPipStyle(value: unknown): RenderPipStyle {
    return isRenderPipStyle(value) ? value : 'circle';
}
