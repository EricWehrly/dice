import * as THREE from 'three';
import { CameraFactory } from './CameraFactory';
import GameObject from '../game/GameObject';

export type RenderingContextOptions = {
    name: string;
    scene?: THREE.Scene;
    renderer?: THREE.WebGLRenderer;
    camera?: THREE.Camera;
    width?: number;
    height?: number;
}

const createDefaultOptions = (): RenderingContextOptions => ({
    name: 'default',
    scene: new THREE.Scene(),
    renderer: new THREE.WebGLRenderer(),
    camera: CameraFactory.createCamera(),
    width: window.innerWidth,
    height: window.innerHeight
});

export abstract class RenderingContextManager {
    private static _firstContext: RenderingContextManager | null = null;
    private static _contextsByName: { [key: string]: RenderingContextManager } = {};

    // Map of scene object UUIDs to game objects
    private _sceneObjectMapping: Map<string, GameObject> = new Map();

    static get FirstOrDefault() { return RenderingContextManager._firstContext; }
    static get ByName() { return (name: string) => RenderingContextManager._contextsByName[name]; }

    private _name: string;
    private _scene: THREE.Scene;
    private _renderer: THREE.WebGLRenderer;
    private _camera: THREE.Camera;
    private _width: number;
    private _height: number;

    get name() { return this._name; }
    get scene() { return this._scene; }
    get renderer() { return this._renderer; }
    get camera() { return this._camera; }
    get width() { return this._width; }
    get height() { return this._height; }

    set width(value: number) {
        this._width = value;
        this.updateAspectRatio();
    }

    set height(value: number) {
        this._height = value;
        this.updateAspectRatio();
    }

    constructor(options: RenderingContextOptions) {
        if(RenderingContextManager._contextsByName[options.name]) { 
            throw new Error(`RenderingContext with name ${options.name} already exists`);
        }

        const defaults = createDefaultOptions();
        const mergedOptions = { ...defaults, ...options } as Required<RenderingContextOptions>;

        console.log('creating rendering context', mergedOptions.name);
        this._name = mergedOptions.name;
        this._scene = mergedOptions.scene;
        this._renderer = mergedOptions.renderer;
        this._camera = mergedOptions.camera;
        this._width = mergedOptions.width;
        this._height = mergedOptions.height;
        this.updateAspectRatio();

        if (!RenderingContextManager._firstContext) {
            RenderingContextManager._firstContext = this;
        }
        RenderingContextManager._contextsByName[this._name] = this;
    }

    private updateAspectRatio(): void {
        if (this._camera instanceof THREE.PerspectiveCamera) {
            this._camera.aspect = this._width / this._height;
            this._camera.updateProjectionMatrix();
        }
    }

    addToScene(gameObject: GameObject, object3d: THREE.Object3D) {
        this._sceneObjectMapping.set(object3d.uuid, gameObject);
        this._scene.add(object3d);
    }

    removeFromScene(object3d: THREE.Object3D) {
        this._scene.remove(object3d);
        this._sceneObjectMapping.delete(object3d.uuid);
    }

    getGameObject(object3d: THREE.Object3D): GameObject | undefined {
        return this._sceneObjectMapping.get(object3d.uuid);
    }
}
