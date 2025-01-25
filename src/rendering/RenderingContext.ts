import * as THREE from 'three';
import { CameraFactory } from './CameraFactory';

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

export abstract class RenderingContext {
    private static _firstContext: RenderingContext | null = null;
    private static _contextsByName: { [key: string]: RenderingContext } = {};

    static get FirstOrDefault() { return RenderingContext._firstContext; }
    static get ByName() { return (name: string) => RenderingContext._contextsByName[name]; }

    private _name: string;
    private _scene: THREE.Scene;
    private _renderer: THREE.WebGLRenderer;
    private _camera: THREE.Camera;

    get name() { return this._name; }
    get scene() { return this._scene; }
    get renderer() { return this._renderer; }
    get camera() { return this._camera; }

    constructor(options: RenderingContextOptions) {
        if(RenderingContext._contextsByName[options.name]) { 
            throw new Error(`RenderingContext with name ${options.name} already exists`);
        }

        const mergedOptions = { ...defaultOptions, ...options };

        console.log('creating rendering context', mergedOptions.name);
        this._name = mergedOptions.name;
        this._scene = mergedOptions.scene!;
        this._renderer = mergedOptions.renderer!;
        this._camera = mergedOptions.camera!;

        if (!RenderingContext._firstContext) {
            RenderingContext._firstContext = this;
        }
        RenderingContext._contextsByName[this._name] = this;
    }
}
