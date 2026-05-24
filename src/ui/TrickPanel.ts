import Events from '../../engine/js/events';
import { TrickEvents } from '../game/contracts/TrickContracts';
import { Trick } from '../game/tricks';
import type { EvaluationResult } from '../game/tricks/TrickEvaluator';
import type { RollEvaluatedEvent } from '../game/tricks/TrickEvaluator';

// TODO: Migrate this panel to engine UI component patterns.
export class TrickPanel {
    private readonly trickList: HTMLUListElement;
    private lastResults: EvaluationResult[];

    constructor() {
        this.lastResults = [];

        this.trickList = this.getRequiredElement<HTMLUListElement>('trick-list');
        Events.Subscribe<RollEvaluatedEvent>(
            TrickEvents.ROLL_EVALUATED,
            (event) => {
                this.lastResults = event.results;
                this.render();
            }
        );
    }

    render(): void {
        const resultById = new Map(this.lastResults.map((result) => [result.trickId, result]));
        const tricks = Trick.GetAll<Trick>();

        this.trickList.innerHTML = '';
        for (const trick of tricks) {
            const result = resultById.get(trick.id);

            const li = document.createElement('li');
            li.className = 'trick-item';

            const title = document.createElement('div');
            title.className = 'trick-title';
            title.textContent = trick.name;

            const meta = document.createElement('div');
            meta.className = 'trick-meta';
            const fired = result?.success ? 'hit' : 'miss';
            const highScore = trick.highScore === null ? '-' : String(trick.highScore);
            meta.textContent = `${fired} | HS ${highScore}`;

            li.appendChild(title);
            li.appendChild(meta);
            this.trickList.appendChild(li);
        }
    }

    private getRequiredElement<TElement extends HTMLElement>(id: string): TElement {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Missing required TB-02 DOM element: #${id}`);
        }

        return element as TElement;
    }
}
