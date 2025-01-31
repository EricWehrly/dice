import * as THREE from 'three';
import { Dice } from '../game/Dice';
import { BaseRenderer, RendererOptions } from './BaseRenderer';

export type DiceRendererOptions = RendererOptions & {
    faceCount?: number;
    foreColor?: string;
    backColor?: string;
};

export class DiceRenderer extends BaseRenderer {
    constructor(options: DiceRendererOptions) {
        super(options);
        this.geometry = new THREE.BoxGeometry();
        this.material = new THREE.MeshBasicMaterial({ color: options.backColor });
    }

    public render(context: CanvasRenderingContext2D): void {
        context.fillStyle = 'white';
        context.fillRect(0, 0, 100, 100);
    }
}

BaseRenderer.registerRenderer(Dice.name, DiceRenderer);
