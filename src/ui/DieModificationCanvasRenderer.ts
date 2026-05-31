import { drawDieFaceTile } from '../rendering/2d/DieFaceTileRenderer';

export interface DieModificationCanvasRenderInput {
    root: HTMLElement;
    faceCount: number;
    selectedFaceIndex: number; // 0+ = face index
    preview: number[];
    deltas: number[];
}

/**
 * Canvas-only renderer for the modification panel face strip.
 */
export class DieModificationCanvasRenderer {
    private lastTilesCount = 3; // Default fallback
    private readonly selectionFadeDurationMs = 180;
    private animationFrameId: number | null = null;
    private lastRenderInput: DieModificationCanvasRenderInput | null = null;
    private previousSelectedFaceIndex: number | null = null;
    private currentSelectedFaceIndex: number | null = null;
    private selectionFadeStartMs = 0;

    render(input: DieModificationCanvasRenderInput): void {
        this.lastRenderInput = input;

        if (this.currentSelectedFaceIndex === null) {
            this.currentSelectedFaceIndex = input.selectedFaceIndex;
            this.previousSelectedFaceIndex = input.selectedFaceIndex;
            this.selectionFadeStartMs = performance.now() - this.selectionFadeDurationMs;
        } else if (this.currentSelectedFaceIndex !== input.selectedFaceIndex) {
            this.previousSelectedFaceIndex = this.currentSelectedFaceIndex;
            this.currentSelectedFaceIndex = input.selectedFaceIndex;
            this.selectionFadeStartMs = performance.now();
        }

        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        this.drawFrame(performance.now());
    }

    private drawFrame(now: number): void {
        const input = this.lastRenderInput;
        if (!input) {
            return;
        }

        const { root, faceCount, selectedFaceIndex, preview, deltas } = input;

        const canvas = root.querySelector<HTMLCanvasElement>('#die-mod-canvas');
        if (!canvas) {
            return;
        }

        const canvasWrap = root.querySelector<HTMLElement>('.die-mod-canvas-wrap');
        if (!canvasWrap) {
            return;
        }

        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }

        const dpr = window.devicePixelRatio || 1;
        const tileSize = 56;
        const tileGap = 8;
        const paddingX = 2;
        const paddingTop = 2;
        const paddingBottom = 2;
        const textTopOffset = 7;
        const probabilityLineHeight = 14;
        const deltaLineHeight = 13;
        const textHeight = textTopOffset + probabilityLineHeight + deltaLineHeight;

        // Determine available width from the carousel container.
        // canvasWrap.clientWidth is often 0 (auto-sized by its own canvas), so use the carousel width.
        const carousel = root.querySelector<HTMLElement>('[data-carousel-mode]');
        const wrapperWidth = carousel?.clientWidth ?? 0;
        if (wrapperWidth <= 0) {
            console.warn('[DieModCanvas] Could not determine carousel width — panel may not be laid out yet. Showing all tiles.');
        }
        const minTiles = 3; // Always show at least 3 (carousel)
        const maxTiles = Math.min(faceCount, 6); // Allow up to 6 visible tiles when space allows
        const tileWidth = tileSize + tileGap;
        const availableWidth = wrapperWidth - paddingX * 2;
        // When wrapperWidth is unknown (<=0), fall back to showing all tiles
        const tilesCanFit = wrapperWidth > 0
            ? Math.max(minTiles, Math.min(maxTiles, Math.floor((availableWidth + tileGap) / tileWidth)))
            : maxTiles;
        this.lastTilesCount = tilesCanFit;

        // Check if we need carousel wrapping
        const needsWrapping = tilesCanFit < maxTiles;
        if (needsWrapping && wrapperWidth > 0) {
            console.warn(
                `[DieModCanvas] Not all ${maxTiles} face tiles fit (wrapperWidth=${wrapperWidth}px, tilesCanFit=${tilesCanFit}). Carousel mode active.`
            );
        }
        if (carousel) {
            carousel.dataset.carouselMode = needsWrapping ? 'auto' : 'full';
        }

        const width = paddingX * 2 + tilesCanFit * tileSize + (tilesCanFit - 1) * tileGap;
        const height = paddingTop + tileSize + textHeight + paddingBottom;

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, width, height);

        const tileBg = this.getThemeColor('--color-die-face-bg', '#f8f8f8');
        const tileBorder = this.getThemeColor('--color-die-face-border', '#999');
        const tileText = this.getThemeColor('--color-die-face-text', '#222');
        const uiText = this.getThemeColor('--color-text-primary', '#f6f0da');
        const coreAccent = this.getThemeColor('--color-gold-trim', '#d4af37');
        const coreGlow = this.getThemeColor('--color-gold-trim-soft', '#7f6b2d');
        const fontUi = this.getThemeFont('--font-ui', '"Trebuchet MS", "Segoe UI", sans-serif');

        // Calculate which tiles to show
        const itemCount = faceCount;
        let itemIndices: number[];

        if (needsWrapping) {
            // Carousel mode: show around selected index
            const wrapIndex = (index: number): number => {
                return ((index % itemCount) + itemCount) % itemCount;
            };

            itemIndices = [];
            const halfTiles = Math.floor(tilesCanFit / 2);
            for (let i = -halfTiles; i <= tilesCanFit - halfTiles - 1; i++) {
                itemIndices.push(wrapIndex(selectedFaceIndex + i));
            }
        } else {
            // Full mode: show all tiles
            itemIndices = [];
            for (let i = 0; i < faceCount; i++) {
                itemIndices.push(i);
            }
        }

        // Warn if probability labels are likely to overlap horizontally.
        // TODO: In the future, support multi-row layout when this warning appears.
        let hasLabelOverlapRisk = false;
        const visibleFaceIndices = itemIndices;
        if (visibleFaceIndices.length > 1) {
            context.save();
            context.font = `700 12px ${fontUi}`;
            const maxPreviewWidth = visibleFaceIndices.reduce((max, index) => {
                const label = `${preview[index].toFixed(1)}%`;
                return Math.max(max, context.measureText(label).width);
            }, 0);

            context.font = `600 11px ${fontUi}`;
            const maxDeltaWidth = visibleFaceIndices.reduce((max, index) => {
                const deltaValue = deltas[index];
                if (Math.abs(deltaValue) <= 0.001) {
                    return max;
                }

                const sign = deltaValue > 0 ? '+' : '';
                const label = `${sign}${deltaValue.toFixed(1)}%`;
                return Math.max(max, context.measureText(label).width);
            }, 0);
            context.restore();

            const requiredSpacing = Math.max(maxPreviewWidth, maxDeltaWidth) + 10;
            const centerSpacing = tileSize + tileGap;
            hasLabelOverlapRisk = requiredSpacing > centerSpacing;

            if (hasLabelOverlapRisk) {
                console.warn(
                    `[DieModificationCanvasRenderer] Label overlap risk: required spacing ${requiredSpacing.toFixed(1)} > center spacing ${centerSpacing}.`,
                );
            }
        }

        itemIndices.forEach((itemIndex, position) => {
            const x = paddingX + position * (tileSize + tileGap);
            const isSelected = needsWrapping
                ? position === Math.floor(tilesCanFit / 2)
                : itemIndex === selectedFaceIndex;

            const currentTarget = this.currentSelectedFaceIndex ?? selectedFaceIndex;
            const previousTarget = this.previousSelectedFaceIndex ?? currentTarget;
            const fadeProgress = Math.min(
                1,
                Math.max(0, (now - this.selectionFadeStartMs) / this.selectionFadeDurationMs),
            );
            const prevGlow = itemIndex === previousTarget ? 1 : 0;
            const nextGlow = itemIndex === currentTarget ? 1 : 0;
            const glowAlpha = prevGlow * (1 - fadeProgress) + nextGlow * fadeProgress;

            // Distance-based opacity: 10% reduction per step away from selected.
            // Uses circular (wrap-around) distance through the full item ring, same as nav button wrapping.
            // NOTE: This opacity fade is canvas-specific; do NOT port this to 3D rendering.
            const raw = itemIndex - selectedFaceIndex;
            const circularDistance = Math.abs(((raw + itemCount + Math.floor(itemCount / 2)) % itemCount) - Math.floor(itemCount / 2));
            const opacity = Math.max(0.3, 1 - circularDistance * 0.1);

            // Draw face tile
            drawDieFaceTile(context, {
                x,
                y: paddingTop,
                size: tileSize,
                die: { faceUp: itemIndex + 1, active: true, locked: false },
                colors: {
                    fill: tileBg,
                    stroke: tileBorder,
                    text: tileText,
                },
                shadowOptions: { color: 'transparent', blur: 0, offsetY: 0 },
                opacityMultiplier: opacity,
            });

            if (isSelected || glowAlpha > 0.001) {
                // Add glow to selected item
                context.save();
                context.globalAlpha = Math.max(glowAlpha, isSelected ? 0.001 : 0);
                context.strokeStyle = coreAccent;
                context.shadowColor = coreGlow;
                context.shadowBlur = 8;
                context.lineWidth = 2;
                context.strokeRect(x - 2, paddingTop - 2, tileSize + 4, tileSize + 4);
                context.restore();
            }

            // Draw probability text below every visible face.
            if (!hasLabelOverlapRisk) {
                context.globalAlpha = 1;
                context.fillStyle = uiText;
                context.font = `700 12px ${fontUi}`;
                context.textAlign = 'center';
                context.textBaseline = 'top';

                const previewValue = preview[itemIndex];
                const deltaValue = deltas[itemIndex];
                const textY = paddingTop + tileSize + textTopOffset;

                // Show preview probability
                const previewText = previewValue.toFixed(1) + '%';
                context.fillText(previewText, x + tileSize / 2, textY);

                // Show delta if non-zero
                if (Math.abs(deltaValue) > 0.001) {
                    context.font = `600 11px ${fontUi}`;
                    context.fillStyle = deltaValue > 0 ? 'rgb(76, 200, 100)' : 'rgb(200, 100, 76)';
                    const deltaSign = deltaValue > 0 ? '+' : '';
                    const deltaText = deltaSign + deltaValue.toFixed(1) + '%';
                    context.fillText(deltaText, x + tileSize / 2, textY + probabilityLineHeight);
                }
            }
        });

        context.globalAlpha = 1;

        const fadeProgress = Math.min(
            1,
            Math.max(0, (now - this.selectionFadeStartMs) / this.selectionFadeDurationMs),
        );
        if (fadeProgress < 1 && this.lastRenderInput) {
            this.animationFrameId = requestAnimationFrame((timestamp) => this.drawFrame(timestamp));
        } else {
            this.animationFrameId = null;
        }
    }

    private getThemeColor(variableName: string, fallback: string): string {
        const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
        return value || fallback;
    }

    private getThemeFont(variableName: string, fallback: string): string {
        const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
        return value || fallback;
    }
}
