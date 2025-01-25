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
    private static firstContext: RenderingContext | null = null;
    private static contextsByName: { [key: string]: RenderingContext } = {};

    static get FirstOrDefault() { return RenderingContext.firstContext; }
    static ByName(name: string) { return RenderingContext.contextsByName[name]; }

    name: string;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    camera: THREE.Camera;

    constructor(options: RenderingContextOptions) {
        if(RenderingContext.contextsByName[options.name]) { 
            throw new Error(`RenderingContext with name ${options.name} already exists`);
        }

        const mergedOptions = { ...defaultOptions, ...options };

        console.log('creating rendering context', mergedOptions.name);
        this.name = mergedOptions.name;
        this.scene = mergedOptions.scene!;
        this.renderer = mergedOptions.renderer!;
        this.camera = mergedOptions.camera!;

        if (!RenderingContext.firstContext) {
            RenderingContext.firstContext = this;
        }
        RenderingContext.contextsByName[this.name] = this;
    }
}
