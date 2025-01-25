import * as THREE from 'three';
import { GameObjectRenderer } from './GameObjectRenderer';

const FOV = 75;
const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const NEAR_CLIP = 0.1;
const FAR_CLIP = 1000;
const CAMERA_POSITION_Z = 5;
const ROTATION_INCREMENT = 0.01;

export class RotationViewer {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private objects: GameObjectRenderer[] = [];

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(FOV, ASPECT_RATIO, NEAR_CLIP, FAR_CLIP);
        this.renderer = new THREE.WebGLRenderer();

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
