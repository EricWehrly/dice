import * as THREE from 'three';
import { RenderingContextManager, RenderingContextOptions } from './RenderingContextManager';
import GameObject from '../game/GameObject';

const CAMERA_POSITION_Z = 5;
const ROTATION_INCREMENT = 0.01;

export type RotationViewerOptions = RenderingContextOptions & {
    gameObject: GameObject;
    renderer: THREE.Object3D;   // maybe just for now
};

export class RotationViewer extends RenderingContextManager {
    private container: HTMLDivElement;

    constructor(options: RenderingContextOptions) {
        super(options);

        // Create container div for the viewer
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.zIndex = '1000';
        this.container.style.background = '#2d2d2d';
        this.container.style.padding = '10px';
        this.container.style.borderRadius = '5px';
        this.container.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';

        this.renderer.setSize(this.width, this.height);
        this.container.appendChild(this.renderer.domElement);
        document.body.appendChild(this.container);
        
        this.camera.position.z = CAMERA_POSITION_Z;
    }

    public setPosition(x: number, y: number): void {
        this.container.style.left = `${x}px`;
        this.container.style.top = `${y}px`;
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
