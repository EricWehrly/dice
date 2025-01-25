import { GameObjectRenderer } from "./GameObjectRenderer";

export type DiceRendererOptions = {
    gameObject: GameObject;
}

export class DiceRenderer extends GameObjectRenderer {

    constructor(options: DiceRendererOptions) {
        super(options.gameObject);
    }

  public render(context: CanvasRenderingContext2D): void {
    context.fillStyle = 'white';
    context.fillRect(0, 0, 100, 100);
  }
}
