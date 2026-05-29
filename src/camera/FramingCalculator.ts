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

    return {
        position,
        target,
        fov: camera.fovDegrees,
    };
}
