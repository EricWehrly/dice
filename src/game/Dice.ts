import GameObject, { GameObjectOptions } from './GameObject';

export type DiceOptions = GameObjectOptions & {
    faceCount?: number;
    foreColor: string;
    backColor: string;
    pipStyle?: string;
};

export class DiceOptionsDefaults implements Partial<DiceOptions> {
    faceCount = 6;
    pipStyle = '';
}

export class Dice extends GameObject {
    readonly faceCount: number;
    readonly foreColor: string;
    readonly backColor: string;
    readonly pipStyle: string;

    constructor(options: DiceOptions) {
        const defaultOptions = new DiceOptionsDefaults();
        const diceOptions = ({ ...defaultOptions, ...options } as Required<DiceOptions>);
        super(diceOptions);
        
        this.faceCount = diceOptions.faceCount;
        this.foreColor = diceOptions.foreColor;
        this.backColor = diceOptions.backColor;
        this.pipStyle = diceOptions.pipStyle;
    }

    public update(): void {
        // throw new Error("Method not implemented.");
    }
}
