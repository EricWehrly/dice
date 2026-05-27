import { buildFaceVertices, projectFace } from '../../rendering/2d/DieIsometricRenderer';

describe('DieIsometricRenderer geometry', () => {
    it('keeps shared-corner relationships for the 3-face projection', () => {
        const size = 1.5;
        const scale = 28;
        const offsetX = 0;
        const offsetY = 0;

        const faces = buildFaceVertices(size);
        const top = projectFace(faces.top, scale, offsetX, offsetY);
        const right = projectFace(faces.right, scale, offsetX, offsetY);
        const front = projectFace(faces.front, scale, offsetX, offsetY);

        // Constraint 1: top-left corner of the 3-face must share the top's left-most corner.
        expect(front[0].x).toBeCloseTo(top[3].x, 6);
        expect(front[0].y).toBeCloseTo(top[3].y, 6);

        // Constraint 2: top-right corner of the 3-face must share top-left corner of the 6-face.
        expect(front[1].x).toBeCloseTo(right[1].x, 6);
        expect(front[1].y).toBeCloseTo(right[1].y, 6);
    });
});
