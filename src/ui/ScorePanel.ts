import Events from '../../engine/js/events';
import { TrickEvents } from '../game/contracts/TrickContracts';
import type { ScoreUpdatedEvent } from '../game/score/ScoreProgressionTracker';

export class ScorePanel {
    private readonly scorePanel: HTMLDivElement;
    private highScore = 0;

    constructor() {
        this.scorePanel = this.getRequiredElement<HTMLDivElement>('score-panel');

        Events.Subscribe<ScoreUpdatedEvent>(TrickEvents.SCORE_UPDATED, (event) => {
            this.highScore = event.highScore;
            this.render();
        });
    }

    render(): void {
        this.scorePanel.textContent = `High Score: ${this.highScore}`;
    }

    private getRequiredElement<TElement extends HTMLElement>(id: string): TElement {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Missing required TB-04 DOM element: #${id}`);
        }

        return element as TElement;
    }
}
