export class InputManager {
    private static instance: InputManager;
    private lastThrowTime: number = 0;
    private isInspecting: boolean = false;

    static get Instance(): InputManager {
        if (!InputManager.instance) {
            InputManager.instance = new InputManager();
        }
        return InputManager.instance;
    }

    canThrow(): boolean {
        const now = Date.now();
        const cooldown = 2000; // 2 seconds
        return !this.isInspecting && (now - this.lastThrowTime) > cooldown;
    }

    recordThrow(): void {
        this.lastThrowTime = Date.now();
    }

    setInspecting(value: boolean): void {
        this.isInspecting = value;
    }

    reset(): void {
        this.lastThrowTime = 0;
        this.isInspecting = false;
    }
}
