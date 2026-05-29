import * as THREE from 'three';
import { calculateCameraForBounds, calculatePitchAngle } from '../../camera/FramingCalculator';

function ndcFits(bounds: THREE.Box3, state: { position: THREE.Vector3; target: THREE.Vector3; fov?: number }, aspectRatio: number): boolean {
    const camera = new THREE.PerspectiveCamera(state.fov ?? 45, aspectRatio, 0.1, 1000);
    camera.position.copy(state.position);
    camera.lookAt(state.target);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);

    const corners = [
        new THREE.Vector3(bounds.min.x, bounds.min.y, bounds.min.z),
        new THREE.Vector3(bounds.min.x, bounds.min.y, bounds.max.z),
        new THREE.Vector3(bounds.min.x, bounds.max.y, bounds.min.z),
        new THREE.Vector3(bounds.min.x, bounds.max.y, bounds.max.z),
        new THREE.Vector3(bounds.max.x, bounds.min.y, bounds.min.z),
        new THREE.Vector3(bounds.max.x, bounds.min.y, bounds.max.z),
        new THREE.Vector3(bounds.max.x, bounds.max.y, bounds.min.z),
        new THREE.Vector3(bounds.max.x, bounds.max.y, bounds.max.z),
    ];

    return corners.every((corner) => {
        const projected = corner.clone().project(camera);
        return (
            Number.isFinite(projected.x) &&
            Number.isFinite(projected.y) &&
            Math.abs(projected.x) <= 1.01 &&
            Math.abs(projected.y) <= 1.01
        );
    });
}

describe('FramingCalculator', () => {
    it('calculates pitch angle from distance and height', () => {
        expect(calculatePitchAngle(10, 5)).toBeCloseTo(26.565, 2);
    });

    it('frames a single die while keeping off-axis composition', () => {
        const bounds = new THREE.Box3(
            new THREE.Vector3(-0.5, -0.5, -0.5),
            new THREE.Vector3(0.5, 0.5, 0.5),
        );

        const state = calculateCameraForBounds(bounds, {
            fovDegrees: 45,
            aspectRatio: 16 / 9,
        });

        expect(state.position.x).not.toBeCloseTo(state.target.x, 3);
        expect(state.position.y).toBeGreaterThan(state.target.y);
        expect(state.position.z).toBeGreaterThan(state.target.z);
        expect(ndcFits(bounds, state, 16 / 9)).toBe(true);
    });

    it('frames a wide multi-die layout', () => {
        const bounds = new THREE.Box3(
            new THREE.Vector3(-1, -0.6, -1),
            new THREE.Vector3(8.5, 0.8, 1),
        );

        const state = calculateCameraForBounds(bounds, {
            fovDegrees: 45,
            aspectRatio: 16 / 9,
        });

        expect(ndcFits(bounds, state, 16 / 9)).toBe(true);
    });

    it('frames a deep layout and respects distance constraints', () => {
        const bounds = new THREE.Box3(
            new THREE.Vector3(-1, -0.5, -4),
            new THREE.Vector3(4, 0.6, 3.5),
        );

        const state = calculateCameraForBounds(
            bounds,
            {
                fovDegrees: 45,
                aspectRatio: 4 / 3,
            },
            {
                minDistance: 3,
                maxDistance: 14,
            },
        );

        expect(state.position.z - state.target.z).toBeLessThanOrEqual(16);
        expect(ndcFits(bounds, state, 4 / 3)).toBe(true);
    });
});
