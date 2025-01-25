import * as THREE from 'three';

export abstract class GameObjectRenderer {
    protected gameObject: GameObject;
    protected mesh?: THREE.Mesh;

    constructor(gameObject: GameObject) {
        this.gameObject = gameObject;
    }

    public abstract render(context: CanvasRenderingContext2D): void;

    public getMesh(): THREE.Mesh | undefined {
        return this.mesh;
    }
}
