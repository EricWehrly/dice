export function readCssTimeMs(element: HTMLElement, property: string, fallbackMs: number): number {
    const raw = window.getComputedStyle(element).getPropertyValue(property).trim().toLowerCase();

    if (raw.endsWith('ms')) {
        const parsed = Number.parseFloat(raw.slice(0, -2));
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    } else if (raw.endsWith('s')) {
        const parsed = Number.parseFloat(raw.slice(0, -1));
        if (Number.isFinite(parsed)) {
            return parsed * 1000;
        }
    }

    return fallbackMs;
}
