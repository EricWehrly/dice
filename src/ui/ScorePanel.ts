import Events from '../../engine/js/events';
import { TrickEvents } from '../game/contracts/TrickContracts';
import type { ScoreUpdatedEvent } from '../game/score/ScoreProgressionTracker';

export class ScorePanel {
    private readonly scorePanel: HTMLDivElement;
    private highScore: number;
    private previousDigitCount = 0;
    private hasRendered = false;

    constructor(initialHighScore = 0) {
        this.scorePanel = this.getRequiredElement<HTMLDivElement>('score-panel');
        this.highScore = initialHighScore;
        this.previousDigitCount = String(this.highScore).length;

        Events.Subscribe<ScoreUpdatedEvent>(TrickEvents.SCORE_UPDATED, (event) => {
            this.highScore = event.highScore;
            this.render();
        });
    }

    render(): void {
        const currentDigitCount = String(this.highScore).length;
        const digitCountIncreased = currentDigitCount > this.previousDigitCount;

        if (this.hasRendered && (digitCountIncreased || this.highScore > 0)) {
            this.scorePanel.classList.remove('score-panel--highlight');
            // Trigger reflow to restart animation
            void this.scorePanel.offsetWidth;
            this.scorePanel.classList.add('score-panel--highlight');
        }

        this.scorePanel.textContent = `High Score: ${this.highScore}`;
        this.previousDigitCount = currentDigitCount;
        this.hasRendered = true;
    }

    private getRequiredElement<TElement extends HTMLElement>(id: string): TElement {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Missing required TB-04 DOM element: #${id}`);
        }

        return element as TElement;
    }
}
