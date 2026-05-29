import * as THREE from 'three';
import { ThreeCam } from '../../engine/js/rendering/Threecam';
import { CameraState } from './FramingCalculator';

type EasingFn = (t: number) => number;

interface AnimationRequest {
    target: CameraState;
    durationMs: number;
    easing: EasingFn;
}

const easeInOutCubic: EasingFn = (t: number): number => {
    if (t < 0.5) {
        return 4 * t * t * t;
    }
    return 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export class CameraAnimator {
    private readonly queue: AnimationRequest[] = [];
    private running = false;

    constructor(private readonly cameraRig: ThreeCam) {}

    animateCameraTo(target: CameraState, durationMs = 500, easing: EasingFn = easeInOutCubic): void {
        this.queue.push({ target, durationMs, easing });
        if (!this.running) {
            this.runNext();
        }
    }

    private runNext(): void {
        const next = this.queue.shift();
        if (!next) {
            this.running = false;
            return;
        }

        this.running = true;

        const camera = this.cameraRig.camera;
        const startPosition = camera.position.clone();
        const startTarget = this.resolveCurrentTarget();
        const startFov = camera instanceof THREE.PerspectiveCamera ? camera.fov : next.target.fov;
        const endFov = next.target.fov ?? startFov;
        const startTime = performance.now();

        const step = (time: number): void => {
            const elapsed = time - startTime;
            const rawProgress = next.durationMs <= 0 ? 1 : elapsed / next.durationMs;
            const progress = THREE.MathUtils.clamp(rawProgress, 0, 1);
            const eased = next.easing(progress);

            const position = new THREE.Vector3().lerpVectors(startPosition, next.target.position, eased);
            const lookTarget = new THREE.Vector3().lerpVectors(startTarget, next.target.target, eased);

            camera.position.copy(position);
            this.cameraRig.lookAt(lookTarget);
            if (this.cameraRig.controls) {
                this.cameraRig.controls.target.copy(lookTarget);
                this.cameraRig.controls.update(0);
            }

            if (camera instanceof THREE.PerspectiveCamera && typeof startFov === 'number' && typeof endFov === 'number') {
                camera.fov = THREE.MathUtils.lerp(startFov, endFov, eased);
                camera.updateProjectionMatrix();
            }

            if (progress < 1) {
                window.requestAnimationFrame(step);
                return;
            }

            this.runNext();
        };

        window.requestAnimationFrame(step);
    }

    private resolveCurrentTarget(): THREE.Vector3 {
        if (this.cameraRig.controls) {
            return this.cameraRig.controls.target.clone();
        }

        const camera = this.cameraRig.camera;
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
        return camera.position.clone().add(direction.multiplyScalar(10));
    }
}
