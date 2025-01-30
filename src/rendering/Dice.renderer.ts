import * as THREE from 'three';
import GameObject from '../game/GameObject';
import { Dice } from '../game/Dice';

export type DiceRendererOptions = {
    gameObject: GameObject;
}

export class DiceRenderer  {
    constructor(options: DiceRendererOptions) {
        // super(options.gameObject);

    }

    public render(context: CanvasRenderingContext2D): void {
        context.fillStyle = 'white';
        context.fillRect(0, 0, 100, 100);
    }
}

// TODO: Defaults
export type DiceCubeOptions = {
    faceCount: number;
    // TODO: assert this is one of "Colors." (with a mask enum?)
    foreColor: string;
    backColor: string;
}

export class DiceCube extends THREE.Mesh {
    constructor(gameObject: Dice) {

        super();

        this.geometry = new THREE.BoxGeometry();
        this.material = new THREE.MeshBasicMaterial({ color: gameObject.backColor });
    }
}
