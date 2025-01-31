import * as THREE from 'three';
import GameObject from '../game/GameObject';

export type RendererOptions = {
    gameObject: GameObject;
};

export type RendererConstructor = new (options: RendererOptions) => BaseRenderer;

export abstract class BaseRenderer extends THREE.Mesh {
    protected gameObject: GameObject;

    constructor(options: RendererOptions) {
        super();
        this.gameObject = options.gameObject;
    }

    abstract render(context: CanvasRenderingContext2D): void;

    static registerRenderer(gameObjectType: string, renderer: RendererConstructor) {
        if (!BaseRenderer.registry) {
            BaseRenderer.registry = new Map();
        }
        // BaseRenderer.registry.set(gameObjectType, renderer);
        BaseRenderer.registry.set(gameObjectType, renderer);
        console.trace(`Registered renderer for ${gameObjectType}`);
    }

    static getRenderer(gameObjectType: string): RendererConstructor | undefined {
        return BaseRenderer.registry?.get(gameObjectType);
    }

    private static registry: Map<string, RendererConstructor>;
}
