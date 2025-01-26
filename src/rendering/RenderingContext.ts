import * as THREE from 'three';
import { CameraFactory } from './CameraFactory';
import GameObject from '../game/GameObject';

export type RenderingContextOptions = {
    name: string;
    scene?: THREE.Scene;
    renderer?: THREE.WebGLRenderer;
    camera?: THREE.Camera;
}

const defaultOptions: Partial<RenderingContextOptions> = {
    scene: new THREE.Scene(),
    renderer: new THREE.WebGLRenderer(),
    camera: CameraFactory.createCamera()
}

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

    get name() { return this._name; }
    get scene() { return this._scene; }
    get renderer() { return this._renderer; }
    get camera() { return this._camera; }

    constructor(options: RenderingContextOptions) {
        if(RenderingContextManager._contextsByName[options.name]) { 
            throw new Error(`RenderingContext with name ${options.name} already exists`);
        }

        const mergedOptions = { ...defaultOptions, ...options };

        console.log('creating rendering context', mergedOptions.name);
        this._name = mergedOptions.name;
        this._scene = mergedOptions.scene!;
        this._renderer = mergedOptions.renderer!;
        this._camera = mergedOptions.camera!;

        if (!RenderingContextManager._firstContext) {
            RenderingContextManager._firstContext = this;
        }
        RenderingContextManager._contextsByName[this._name] = this;
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
