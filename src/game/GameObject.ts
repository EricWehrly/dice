export interface GameObjectOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
}

const defaultGameObjectOptions: GameObjectOptions = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  name: "GameObject"
};

export default abstract class GameObject {
  protected x: number;
  protected y: number;
  protected width: number;
  protected height: number;
  protected name: string;

  constructor(options: GameObjectOptions) {
    const mergedOptions = { ...defaultGameObjectOptions, ...options } as Required<GameObjectOptions>;
    this.x = mergedOptions.x;
    this.y = mergedOptions.y;
    this.width = mergedOptions.width;
    this.height = mergedOptions.height;
    this.name = mergedOptions.name;
  }

  public abstract update(): void;
}
