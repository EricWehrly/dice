import { DieModificationCanvasRenderer } from '../../ui/DieModificationCanvasRenderer';
import { drawDieFaceTile } from '../../rendering/2d/DieFaceTileRenderer';

vi.mock('../../rendering/2d/DieFaceTileRenderer', () => ({
    drawDieFaceTile: vi.fn(),
}));

type MockContext = ReturnType<typeof createMockContext>;

function createMockContext() {
    return {
        setTransform: vi.fn(),
        clearRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        fillText: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        clip: vi.fn(),
        measureText: vi.fn((text: string) => ({ width: text.length * 7 })),
        createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        globalAlpha: 1,
        shadowColor: '',
        shadowBlur: 0,
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        font: '',
        textAlign: 'start' as CanvasTextAlign,
        textBaseline: 'alphabetic' as CanvasTextBaseline,
    };
}

function ctx(mock: MockContext): CanvasRenderingContext2D {
    return mock as unknown as CanvasRenderingContext2D;
}

describe('DieModificationCanvasRenderer', () => {
    it('renders preview and delta labels using percentage values without double scaling', () => {
        const root = document.createElement('div');
        root.innerHTML = `
            <div data-carousel-mode="auto">
                <div class="die-mod-canvas-wrap">
                    <canvas id="die-mod-canvas"></canvas>
                </div>
            </div>
        `;

        const canvasWrap = root.querySelector<HTMLElement>('.die-mod-canvas-wrap');
        const canvas = root.querySelector<HTMLCanvasElement>('#die-mod-canvas');

        expect(canvasWrap).not.toBeNull();
        expect(canvas).not.toBeNull();

        Object.defineProperty(canvasWrap!, 'clientWidth', {
            configurable: true,
            get: () => 360,
        });

        const context = createMockContext();
        vi.spyOn(canvas!, 'getContext').mockReturnValue(ctx(context));

        const renderer = new DieModificationCanvasRenderer();
        renderer.render({
            root,
            faceCount: 6,
            selectedFaceIndex: 0,
            preview: [16.7, 16.7, 16.7, 16.7, 16.7, 16.5],
            deltas: [1.2, -0.4, -0.2, -0.2, -0.2, -0.2],
        });

        const labels = context.fillText.mock.calls.map((call) => String(call[0]));

        expect(labels).toContain('16.7%');
        expect(labels).toContain('+1.2%');
        expect(labels).toContain('-0.4%');
        expect(labels).not.toContain('1666.7%');
        expect(labels).not.toContain('+120.0%');
    });

    it('does not render delta labels when all deltas are zero', () => {
        const root = document.createElement('div');
        root.innerHTML = `
            <div data-carousel-mode="auto">
                <div class="die-mod-canvas-wrap">
                    <canvas id="die-mod-canvas"></canvas>
                </div>
            </div>
        `;

        const canvasWrap = root.querySelector<HTMLElement>('.die-mod-canvas-wrap');
        const canvas = root.querySelector<HTMLCanvasElement>('#die-mod-canvas');

        expect(canvasWrap).not.toBeNull();
        expect(canvas).not.toBeNull();

        Object.defineProperty(canvasWrap!, 'clientWidth', {
            configurable: true,
            get: () => 360,
        });

        const context = createMockContext();
        vi.spyOn(canvas!, 'getContext').mockReturnValue(ctx(context));

        const renderer = new DieModificationCanvasRenderer();
        renderer.render({
            root,
            faceCount: 6,
            selectedFaceIndex: 0,
            preview: [16.7, 16.7, 16.7, 16.7, 16.7, 16.5],
            deltas: [0, 0, 0, 0, 0, 0],
        });

        const labels = context.fillText.mock.calls.map((call) => String(call[0]));
        const deltaLabels = labels.filter((label) => /^[-+]\d/.test(label));

        expect(labels).toContain('16.7%');
        expect(deltaLabels.length).toBe(0);
    });
});
