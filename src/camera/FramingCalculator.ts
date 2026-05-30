import * as THREE from 'three';

export interface CameraState {
    position: THREE.Vector3;
    target: THREE.Vector3;
    fov?: number;
}

export interface FramingConstraints {
    horizontalOffsetPercent: number;
    /** World-space X width at which relaxation begins (offset stays full below this). */
    horizontalOffsetRelaxStartWidth: number;
    /** World-space X width at which the horizontal offset has fully relaxed to ~0. */
    horizontalOffsetRelaxWidth: number;
    depthOffsetPercent: number;
    lookDownPitchDegrees: number;
    verticalTargetOffsetPercent: number;
    bottomAnchorNdc: number | null;
    minDistance: number;
    maxDistance: number;
    paddingPercent: number;
}

export interface FramingCameraInput {
    fovDegrees: number;
    aspectRatio: number;
}

const DEFAULT_CONSTRAINTS: FramingConstraints = {
    horizontalOffsetPercent: -0.15,
    horizontalOffsetRelaxStartWidth: 5,
    horizontalOffsetRelaxWidth: 23,
    depthOffsetPercent: 0.05,
    lookDownPitchDegrees: 42,
    verticalTargetOffsetPercent: 0,
    bottomAnchorNdc: null,
    minDistance: 4,
    maxDistance: 24,
    paddingPercent: 0.15,
};

const EPSILON = 0.0001;

export function calculatePitchAngle(distance: number, height: number): number {
    const safeDistance = Math.max(EPSILON, distance);
    return THREE.MathUtils.radToDeg(Math.atan2(height, safeDistance));
}

export function calculateCameraForBounds(
    bounds: THREE.Box3,
    camera: FramingCameraInput,
    constraints: Partial<FramingConstraints> = {},
): CameraState {
    const resolvedConstraints: FramingConstraints = {
        ...DEFAULT_CONSTRAINTS,
        ...constraints,
    };

    const target = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const composedTarget = target.clone();

    const halfVerticalFov = THREE.MathUtils.degToRad(camera.fovDegrees * 0.5);
    const halfHorizontalFov = Math.atan(Math.tan(halfVerticalFov) * Math.max(camera.aspectRatio, EPSILON));

    const requiredDistanceVertical = (size.y * 0.5) / Math.tan(Math.max(halfVerticalFov, EPSILON));
    const requiredDistanceHorizontal = (size.x * 0.5) / Math.tan(Math.max(halfHorizontalFov, EPSILON));
    const requiredDistanceDepth = size.z * 0.5;
    // Reduced sphere term (0.6×) catches corner clipping from pitch/offset without dominating typical layouts.
    const halfMinFov = Math.min(halfVerticalFov, halfHorizontalFov);
    const requiredDistanceSphere = (size.length() * 0.5 * 0.75) / Math.sin(Math.max(halfMinFov, EPSILON));

    // paddingPercent scales the final distance directly so it has a clear, linear zoom effect.
    const tightFitDistance = Math.max(
        requiredDistanceVertical,
        requiredDistanceHorizontal,
        requiredDistanceDepth,
        requiredDistanceSphere,
        1,
    );
    const unclampedDistance = tightFitDistance * (1 + resolvedConstraints.paddingPercent);
    const distance = THREE.MathUtils.clamp(
        unclampedDistance,
        resolvedConstraints.minDistance,
        resolvedConstraints.maxDistance,
    );

    const pitchRadians = THREE.MathUtils.degToRad(resolvedConstraints.lookDownPitchDegrees);
    const horizontalDistance = distance * Math.cos(pitchRadians);
    const cameraHeight = distance * Math.sin(pitchRadians);

    // Relax horizontal offset toward 0 as the layout widens so framing stays centred for many dice.
    const relaxRange = Math.max(resolvedConstraints.horizontalOffsetRelaxWidth - resolvedConstraints.horizontalOffsetRelaxStartWidth, EPSILON);
    const relaxT = THREE.MathUtils.clamp((size.x - resolvedConstraints.horizontalOffsetRelaxStartWidth) / relaxRange, 0, 1);
    const smoothT = relaxT * relaxT * (3 - 2 * relaxT); // smoothstep
    const effectiveHorizontalOffset = resolvedConstraints.horizontalOffsetPercent * (1 - smoothT * 0.95);
    const lateralOffset = size.x * effectiveHorizontalOffset;
    const depthOffset = size.z * resolvedConstraints.depthOffsetPercent;

    const position = new THREE.Vector3(
        target.x + lateralOffset,
        target.y + cameraHeight,
        target.z + horizontalDistance + depthOffset,
    );

    let targetYOffset = size.y * resolvedConstraints.verticalTargetOffsetPercent;

    if (resolvedConstraints.bottomAnchorNdc !== null) {
        const desiredBottomNdc = resolvedConstraints.bottomAnchorNdc;
        const evaluateBottomNdc = (offsetY: number): number => {
            const lookTarget = new THREE.Vector3(target.x, target.y + offsetY, target.z);
            const testCamera = new THREE.PerspectiveCamera(camera.fovDegrees, Math.max(camera.aspectRatio, EPSILON), 0.1, 1000);
            testCamera.position.copy(position);
            testCamera.up.set(0, 1, 0);
            testCamera.lookAt(lookTarget);
            testCamera.updateProjectionMatrix();
            testCamera.updateMatrixWorld(true);

            const points: THREE.Vector3[] = [];
            const min = bounds.min;
            const max = bounds.max;
            for (const x of [min.x, max.x]) {
                for (const y of [min.y, max.y]) {
                    for (const z of [min.z, max.z]) {
                        points.push(new THREE.Vector3(x, y, z));
                    }
                }
            }

            let minNdcY = Infinity;
            points.forEach((point) => {
                const ndc = point.clone().project(testCamera);
                minNdcY = Math.min(minNdcY, ndc.y);
            });
            return minNdcY;
        };

        const epsilon = Math.max(size.y * 0.05, 0.01);
        const maxOffset = Math.max(size.y * 2.5, 0.25);
        for (let i = 0; i < 4; i += 1) {
            const currentBottomNdc = evaluateBottomNdc(targetYOffset);
            const error = desiredBottomNdc - currentBottomNdc;
            if (Math.abs(error) < 0.01) {
                break;
            }

            const slopeSample = evaluateBottomNdc(targetYOffset + epsilon);
            const slope = (slopeSample - currentBottomNdc) / epsilon;
            if (Math.abs(slope) < EPSILON) {
                break;
            }

            targetYOffset += error / slope;
            targetYOffset = THREE.MathUtils.clamp(targetYOffset, -maxOffset, maxOffset);
        }
    }

    composedTarget.y += targetYOffset;

    return {
        position,
        target: composedTarget,
        fov: camera.fovDegrees,
    };
}
