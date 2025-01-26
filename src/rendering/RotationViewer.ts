import * as THREE from 'three';
import { RenderingContextManager, RenderingContextOptions } from './RenderingContext';

const CAMERA_POSITION_Z = 5;
const ROTATION_INCREMENT = 0.01;

export class RotationViewer extends RenderingContextManager {

    constructor(options: RenderingContextOptions) {
        super(options);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        
        this.camera.position.z = CAMERA_POSITION_Z;
    }

    public start(): void {
        this.animate();
    }

    private animate = (): void => {
        // Rotate all objects in the scene
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.rotation.x += ROTATION_INCREMENT;
                object.rotation.y += ROTATION_INCREMENT;
            }
        });

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate);
    }
}
