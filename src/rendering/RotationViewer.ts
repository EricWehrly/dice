import * as THREE from 'three';
import { GameObjectRenderer } from './GameObjectRenderer';
import { RenderingContext, RenderingContextOptions } from './RenderingContext';

const CAMERA_POSITION_Z = 5;
const ROTATION_INCREMENT = 0.01;

export class RotationViewer extends RenderingContext {
    private objects: GameObjectRenderer[] = [];

    constructor(options: RenderingContextOptions) {
        super(options);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        
        this.camera.position.z = CAMERA_POSITION_Z;
    }

    public addObject(gameObjectRenderer: GameObjectRenderer): void {
        this.objects.push(gameObjectRenderer);
        const mesh = gameObjectRenderer.getMesh();
        if (mesh) {
            this.scene.add(mesh);
        }
    }

    public start(): void {
        this.animate();
    }

    private animate = (): void => {
        requestAnimationFrame(this.animate);

        // Rotate all objects in the scene
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.rotation.x += ROTATION_INCREMENT;
                object.rotation.y += ROTATION_INCREMENT;
            }
        });

        this.renderer.render(this.scene, this.camera);
    }
}
