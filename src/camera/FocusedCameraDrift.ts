import * as THREE from 'three';
import { ThreeCam } from '../../engine/js/rendering/Threecam';

export class FocusedCameraDrift {
    private centerTarget: THREE.Vector3 | null = null;
    private baseOffset = new THREE.Vector3();
    private active = false;

    private readonly orbitRadius = 0.18;
    private readonly orbitSpeed = 0.0007;
    private readonly swayAmplitude = 0.07;
    private readonly swaySpeed = 0.0011;

    constructor(private readonly cameraRig: ThreeCam) {}

    start(target: THREE.Vector3): void {
        this.centerTarget = target.clone();
        this.baseOffset.copy(this.cameraRig.camera.position).sub(target);
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

        const orbitPhase = timeMs * this.orbitSpeed;
        const swayPhase = timeMs * this.swaySpeed;

        const offset = this.baseOffset.clone();
        offset.x += Math.sin(orbitPhase) * this.orbitRadius;
        offset.z += Math.cos(orbitPhase) * this.orbitRadius;
        offset.y += Math.sin(swayPhase) * this.swayAmplitude;

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
