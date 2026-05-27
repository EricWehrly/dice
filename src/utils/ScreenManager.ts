/**
 * ScreenManager
 * 
 * Manages visibility of mutually-exclusive screens and wires their navigation buttons.
 * Only one screen is visible at a time. All child elements of a hidden screen are
 * automatically hidden via CSS (is-hidden display: none).
 * Screens can be created dynamically if a parent container ID is provided.
 */
export class ScreenManager {
    private screens = new Map<string, HTMLElement>();
    private buttons = new Map<string, HTMLElement[]>();
    private activeScreen: string | null = null;
    private screenContainer: HTMLElement | null = null;

    /**
     * Set the parent container for dynamically created screens.
     */
    setScreenContainer(container: HTMLElement | string): void {
        if (typeof container === 'string') {
            this.screenContainer = document.getElementById(container);
        } else {
            this.screenContainer = container;
        }
    }

    /**
     * Register a screen and its associated navigation buttons.
     * If the screen element doesn't exist and a container is set, create it dynamically.
     * Clicking any button switches to that screen.
     */
    register(id: string, screenEl: HTMLElement | null, buttonEls: HTMLElement[]): void {
        let element = screenEl;

        if (!element) {
            if (!this.screenContainer) {
                throw new Error(`ScreenManager: Screen "${id}" not found and no container set for dynamic creation`);
            }
            element = document.createElement('div');
            element.id = `screen-${id}`;
            element.className = 'play-screen is-hidden';
            this.screenContainer.appendChild(element);
        }

        this.screens.set(id, element);
        this.buttons.set(id, buttonEls);
        buttonEls.forEach(btn => {
            btn.addEventListener('click', () => this.switchTo(id));
        });
    }

    /**
     * Switch to a screen by ID. Hides all other screens and updates button active states.
     */
    switchTo(id: string): void {
        if (!this.screens.has(id)) {
            throw new Error(`ScreenManager: unknown screen "${id}"`);
        }

        this.screens.forEach((el, key) => {
            el.classList.toggle('is-hidden', key !== id);
        });
        this.buttons.forEach((btns, key) => {
            btns.forEach(btn => btn.classList.toggle('is-active', key === id));
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
