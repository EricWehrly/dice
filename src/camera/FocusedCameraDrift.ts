import * as THREE from 'three';
import { ThreeCam } from '../../engine/js/rendering/Threecam';

export class FocusedCameraDrift {
    private centerTarget: THREE.Vector3 | null = null;
    private baseOffset = new THREE.Vector3();
    private active = false;
    private startTimeMs = 0;

    private readonly orbitRadius = 0.18;
    private readonly orbitSpeed = 0.0007;
    private readonly swayAmplitude = 0.07;
    private readonly swaySpeed = 0.0011;
    private readonly rampInDurationMs = 650;

    constructor(private readonly cameraRig: ThreeCam) {}

    start(target: THREE.Vector3, nowMs = performance.now()): void {
        this.centerTarget = target.clone();
        this.baseOffset.copy(this.cameraRig.camera.position).sub(target);
        this.startTimeMs = nowMs;
        this.active = true;
    }

    stop(): void {
        this.active = false;
        this.centerTarget = null;
    }

    update(timeMs: number): void {
        if (!this.active || !this.centerTarget) {
            return;
        }

        const elapsedMs = Math.max(0, timeMs - this.startTimeMs);
        const orbitPhase = elapsedMs * this.orbitSpeed;
        const swayPhase = elapsedMs * this.swaySpeed;
        const rampT = THREE.MathUtils.clamp(elapsedMs / this.rampInDurationMs, 0, 1);
        const rampWeight = rampT * rampT * (3 - 2 * rampT);

        const offset = this.baseOffset.clone();
        offset.x += Math.sin(orbitPhase) * this.orbitRadius * rampWeight;
        offset.z += Math.cos(orbitPhase) * this.orbitRadius * rampWeight;
        offset.y += Math.sin(swayPhase) * this.swayAmplitude * rampWeight;

        const target = this.centerTarget;
        const cameraPosition = target.clone().add(offset);

        this.cameraRig.camera.position.copy(cameraPosition);
        this.cameraRig.lookAt(target);

        if (this.cameraRig.controls) {
            // Here's where we'd configure/enable orbit controls for focus mode if controls were active.
            this.cameraRig.controls.target.copy(target);
            this.cameraRig.controls.update(0);
        }
    }
}
