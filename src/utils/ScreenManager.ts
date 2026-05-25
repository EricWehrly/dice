/**
 * ScreenManager
 * 
 * Manages visibility of mutually-exclusive screens and wires their navigation buttons.
 * Only one screen is visible at a time. All child elements of a hidden screen are
 * automatically hidden via CSS (is-hidden display: none).
 */
export class ScreenManager {
    private screens = new Map<string, HTMLElement>();
    private activeScreen: string | null = null;

    /**
     * Register a screen and its associated navigation buttons.
     * Clicking any button switches to that screen.
     */
    register(id: string, screenEl: HTMLElement, buttonEls: HTMLElement[]): void {
        this.screens.set(id, screenEl);
        buttonEls.forEach(btn => {
            btn.addEventListener('click', () => this.switchTo(id));
        });
    }

    /**
     * Switch to a screen by ID. Hides all other screens.
     */
    switchTo(id: string): void {
        if (!this.screens.has(id)) {
            throw new Error(`ScreenManager: unknown screen "${id}"`);
        }

        this.screens.forEach((el, key) => {
            el.classList.toggle('is-hidden', key !== id);
        });
        this.activeScreen = id;
    }

    /**
     * Check if a screen is currently active.
     */
    isActive(id: string): boolean {
        return this.activeScreen === id;
    }
}
