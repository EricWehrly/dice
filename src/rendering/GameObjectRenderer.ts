import * as THREE from 'three';

interface GameObjectRendererOptions {
    gameObject: GameObject;
}

export abstract class GameObjectRenderer {
    protected gameObject: GameObject;
    protected mesh?: THREE.Mesh;

    constructor(options: GameObjectRendererOptions) {
        this.gameObject = options.gameObject;
    }

    public abstract render(context: CanvasRenderingContext2D): void;

    public getMesh(): THREE.Mesh | undefined {
        return this.mesh;
    }
}
