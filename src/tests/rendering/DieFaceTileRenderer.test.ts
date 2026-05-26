import { drawDieFaceTile } from '../../rendering/2d/DieFaceTileRenderer';

describe('drawDieFaceTile', () => {
    function createMockContext() {
        return {
            save: vi.fn(),
            restore: vi.fn(),
            fillRect: vi.fn(),
            strokeRect: vi.fn(),
            fillText: vi.fn(),
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            closePath: vi.fn(),
            globalAlpha: 1,
            shadowColor: '',
            shadowBlur: 0,
            shadowOffsetY: 0,
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            textAlign: 'start',
            textBaseline: 'alphabetic',
        };
    }

    it('draws pips and does not draw numeric text', () => {
        const context = createMockContext();

        drawDieFaceTile(context, {
            x: 10,
            y: 12,
            die: { faceUp: 5, active: true, locked: false },
            colors: {
                fill: '#fff',
                stroke: '#000',
                text: '#111',
            },
            size: 80,
        });

        expect(context.fillText.mock.calls.length).toBe(0);
        expect(context.arc.mock.calls.length).toBe(5);
    });

    it('draws no pips when face value is zero', () => {
        const context = createMockContext();

        drawDieFaceTile(context, {
            x: 0,
            y: 0,
            die: { faceUp: 0, active: true, locked: false },
            colors: {
                fill: '#fff',
                stroke: '#000',
                text: '#111',
            },
        });

        expect(context.arc.mock.calls.length).toBe(0);
    });

    it('draws a centered middle pip for face value 3', () => {
        const context = createMockContext();

        drawDieFaceTile(context, {
            x: 10,
            y: 20,
            size: 80,
            die: { faceUp: 3, active: true, locked: false },
            colors: {
                fill: '#fff',
                stroke: '#000',
                text: '#111',
            },
        });

        const centerX = 10 + 80 / 2;
        const centerY = 20 + 80 / 2;

        const hasCenterPip = context.arc.mock.calls.some(([cx, cy]) =>
            Math.abs(cx - centerX) < 0.0001 && Math.abs(cy - centerY) < 0.0001,
        );

        expect(context.arc.mock.calls.length).toBe(3);
        expect(hasCenterPip).toBe(true);
    });

    it('draws face value 5 as corners plus center', () => {
        const context = createMockContext();

        drawDieFaceTile(context, {
            x: 0,
            y: 0,
            size: 80,
            die: { faceUp: 5, active: true, locked: false },
            colors: {
                fill: '#fff',
                stroke: '#000',
                text: '#111',
            },
        });

        const centerX = 40;
        const centerY = 40;
        const pipCenters = context.arc.mock.calls.map(([cx, cy]) => [cx, cy]);
        const pipsOnMiddleRow = pipCenters.filter(([, cy]) => Math.abs(cy - centerY) < 0.0001);
        const pipsOnMiddleColumn = pipCenters.filter(([cx]) => Math.abs(cx - centerX) < 0.0001);

        expect(context.arc.mock.calls.length).toBe(5);
        expect(pipsOnMiddleRow.length).toBe(1);
        expect(pipsOnMiddleColumn.length).toBe(1);
    });

    it('draws numeral fallback for face values above readable pip threshold', () => {
        const context = createMockContext();

        drawDieFaceTile(context, {
            x: 4,
            y: 6,
            size: 80,
            die: { faceUp: 12, active: true, locked: false },
            colors: {
                fill: '#fff',
                stroke: '#000',
                text: '#111',
            },
        });

        expect(context.arc.mock.calls.length).toBe(0);
        expect(context.fillText.mock.calls.length).toBe(1);
        expect(context.fillText.mock.calls[0][0]).toBe('12');
    });
});
