import { drawDieFaceTile } from '../rendering/2d/DieFaceTileRenderer';

export interface DieModificationCanvasRenderInput {
    root: HTMLElement;
    faceCount: number;
    selectedFaceIndex: number; // -1 = core, 0+ = face index
    preview: number[];
    deltas: number[];
}

/**
 * Canvas-only renderer for the modification panel face strip.
 */
export class DieModificationCanvasRenderer {
    private lastTilesCount = 3; // Default fallback

    render(input: DieModificationCanvasRenderInput): void {
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
        const padding = 6;
        const textTopOffset = 10;
        const probabilityLineHeight = 14;
        const deltaLineHeight = 13;
        const textHeight = textTopOffset + probabilityLineHeight + deltaLineHeight;

        // Determine available width from the carousel container, subtracting nav buttons.
        // canvasWrap.clientWidth is always 0 (auto grid column sized by its own canvas).
        const carousel = root.querySelector<HTMLElement>('[data-carousel-mode]');
        const prevBtn = root.querySelector<HTMLElement>('.die-mod-face-nav-btn-prev');
        const nextBtn = root.querySelector<HTMLElement>('.die-mod-face-nav-btn-next');
        const navWidth = (prevBtn?.offsetWidth ?? 40) + (nextBtn?.offsetWidth ?? 40);
        const carouselGap = 16; // 2 gaps × 8px
        const wrapperWidth = (carousel?.clientWidth ?? 0) - navWidth - carouselGap;
        if (wrapperWidth <= 0) {
            console.warn('[DieModCanvas] Could not determine carousel width — panel may not be laid out yet. Showing all tiles.');
        }
        const minTiles = 3; // Always show at least 3 (carousel)
        const maxTiles = faceCount + 1; // Max is all tiles (core + faces)
        const tileWidth = tileSize + tileGap;
        const availableWidth = wrapperWidth - padding * 2;
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

        const width = padding * 2 + tilesCanFit * tileSize + (tilesCanFit - 1) * tileGap;
        const height = padding * 2 + tileSize + textHeight;

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
        const corePanelBg = this.getThemeColor('--color-counter-bg', '#111');
        const fontUi = this.getThemeFont('--font-ui', '"Trebuchet MS", "Segoe UI", sans-serif');

        // Calculate which tiles to show
        const itemCount = faceCount + 1;
        let itemIndices: number[];

        if (needsWrapping) {
            // Carousel mode: show around selected index
            const wrapIndex = (index: number): number => {
                const pos = ((index + 1) % itemCount + itemCount) % itemCount;
                return pos - 1;
            };

            itemIndices = [];
            const halfTiles = Math.floor(tilesCanFit / 2);
            for (let i = -halfTiles; i <= tilesCanFit - halfTiles - 1; i++) {
                itemIndices.push(wrapIndex(selectedFaceIndex + i));
            }
        } else {
            // Full mode: show all tiles
            itemIndices = [];
            for (let i = -1; i < faceCount; i++) {
                itemIndices.push(i);
            }
        }

        // Warn if probability labels are likely to overlap horizontally.
        // TODO: In the future, support multi-row layout when this warning appears.
        let hasLabelOverlapRisk = false;
        const visibleFaceIndices = itemIndices.filter((index) => index >= 0);
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
            const x = padding + position * (tileSize + tileGap);
            const isSelected = needsWrapping
                ? position === Math.floor(tilesCanFit / 2)
                : itemIndex === selectedFaceIndex;

            // Distance-based opacity: 10% reduction per step away from selected.
            // Uses circular (wrap-around) distance through the full item ring, same as nav button wrapping.
            const raw = itemIndex - selectedFaceIndex;
            const circularDistance = Math.abs(((raw + itemCount + Math.floor(itemCount / 2)) % itemCount) - Math.floor(itemCount / 2));
            const opacity = Math.max(0.3, 1 - circularDistance * 0.1);

            if (itemIndex === -1) {
                // Draw core tile base with a neutral border so selection glow is the only accent.
                drawDieFaceTile(context, {
                    x,
                    y: padding,
                    size: tileSize,
                    die: { faceUp: 0, active: true, locked: false },
                    colors: {
                        fill: corePanelBg,
                        stroke: tileBorder,
                        text: tileText,
                    },
                    shadowOptions: { color: 'transparent', blur: 0, offsetY: 0 },
                    opacityMultiplier: opacity,
                });

                // Soft core orb: dark center that fades toward the edges.
                context.save();
                context.beginPath();
                context.arc(x + tileSize / 2, padding + tileSize / 2, tileSize * 0.36, 0, Math.PI * 2);
                context.clip();

                const orbGradient = context.createRadialGradient(
                    x + tileSize / 2,
                    padding + tileSize / 2,
                    tileSize * 0.08,
                    x + tileSize / 2,
                    padding + tileSize / 2,
                    tileSize * 0.36,
                );
                orbGradient.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
                orbGradient.addColorStop(0.55, 'rgba(0, 0, 0, 0.45)');
                orbGradient.addColorStop(1, 'rgba(0, 0, 0, 0.06)');

                context.fillStyle = orbGradient;
                context.fillRect(x, padding, tileSize, tileSize);
                context.restore();
            } else {
                // Draw face tile
                drawDieFaceTile(context, {
                    x,
                    y: padding,
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
            }

            if (isSelected) {
                // Add glow to selected item
                context.globalAlpha = 1;
                context.save();
                context.strokeStyle = coreAccent;
                context.shadowColor = coreGlow;
                context.shadowBlur = 8;
                context.lineWidth = 2;
                context.strokeRect(x - 2, padding - 2, tileSize + 4, tileSize + 4);
                context.restore();
            }

            // Draw probability text below every visible face.
            if (itemIndex >= 0 && !hasLabelOverlapRisk) {
                context.globalAlpha = 1;
                context.fillStyle = uiText;
                context.font = `700 12px ${fontUi}`;
                context.textAlign = 'center';
                context.textBaseline = 'top';

                const previewValue = preview[itemIndex];
                const deltaValue = deltas[itemIndex];
                const textY = padding + tileSize + textTopOffset;

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
