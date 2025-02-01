import * as THREE from 'three';
import { Dice } from '../game/Dice';
import { BaseRenderer, RendererOptions } from './BaseRenderer';
import { PipUtils } from './util/PipUtils';

export type DiceRendererOptions = RendererOptions & {
    faceCount?: number;
    foreColor?: string;
    backColor?: string;
};

export class DiceRendererOptionsDefaults implements Partial<DiceRendererOptions> {
    faceCount = 6;
    foreColor = '#000000';
    backColor = '#ffffff';
}

export class DiceRenderer extends BaseRenderer {
    private static readonly ALLOWED_FACE_COUNTS = [4, 6, 8, 12, 20];

    constructor(options: DiceRendererOptions) {
        const defaultOptions = new DiceRendererOptionsDefaults();
        const mergedOptions = { ...defaultOptions, ...options } as Required<DiceRendererOptions>;
        super(mergedOptions);
        if (!DiceRenderer.ALLOWED_FACE_COUNTS.includes(mergedOptions.faceCount)) {
            throw new Error(`Invalid faceCount: ${mergedOptions.faceCount}. Allowed values are ${DiceRenderer.ALLOWED_FACE_COUNTS.join(', ')}`);
        }
        this.geometry = this.createGeometry(mergedOptions.faceCount);
        this.material = new THREE.MeshBasicMaterial({ color: mergedOptions.backColor });
        this.addPips(this, mergedOptions.faceCount, mergedOptions.foreColor);
    }

    private createGeometry(faceCount: number): THREE.BufferGeometry {
        switch (faceCount) {
            case 4:
                return new THREE.TetrahedronGeometry();
            case 6:
                return new THREE.BoxGeometry();
            case 8:
                return new THREE.OctahedronGeometry();
            case 12:
                return new THREE.DodecahedronGeometry();
            case 20:
                return new THREE.IcosahedronGeometry();
            default:
                throw new Error(`Unsupported faceCount: ${faceCount}`);
        }
    }

    private async addPips(parent: THREE.Object3D, faceCount: number, foreColor: string): Promise<void> {
        await PipUtils.addPips(parent, faceCount, foreColor);
    }
}

BaseRenderer.registerRenderer(Dice.name, DiceRenderer);
