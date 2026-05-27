import Events from '../../engine/js/events';
import { type Bag } from '../game/Bag';
import { TrickEvents } from '../game/contracts/TrickContracts';
import { Trick } from '../game/tricks';
import type { RollEvaluatedEvent } from '../game/tricks/TrickEvaluator';

// TODO: Migrate this panel to engine UI component patterns.
export class RollHistoryPanel {
    private readonly bag: Bag;
    private readonly historyList: HTMLOListElement;
    private readonly rollTrickHistory: string[][] = [];

    constructor(bag: Bag) {
        this.bag = bag;
        this.historyList = this.getRequiredElement<HTMLOListElement>('roll-history-list');

        Events.Subscribe<RollEvaluatedEvent>(TrickEvents.ROLL_EVALUATED, (event) => {
            const trickNames = event.results
                .filter((result) => result.success)
                .map((result) => Trick.GetAll<Trick>().find((trick) => trick.id === result.trickId)?.name ?? result.trickId);
            this.rollTrickHistory.push(trickNames);
        });

        Events.Subscribe(TrickEvents.BAG_ROLLED, () => this.render());
        Events.Subscribe(TrickEvents.BAG_CHANGED, () => this.render());
    }

    render(): void {
        const records = this.bag.rollHistory.records;
        // Trim trick history to stay in sync when rollHistory is cleared.
        this.rollTrickHistory.splice(records.length);
        this.historyList.innerHTML = '';

        for (let index = records.length - 1; index >= 0; index -= 1) {
            const record = records[index];
            const item = document.createElement('li');
            item.className = 'roll-history-item';

            const partial = record.some((faceResult) => !faceResult.rolled);
            if (partial) {
                item.classList.add('is-partial');
            }

            for (let faceIndex = 0; faceIndex < record.length; faceIndex += 1) {
                const faceResult = record[faceIndex];
                const face = document.createElement('span');
                face.className = 'roll-history-face';
                if (!faceResult.rolled) {
                    face.classList.add('is-locked');
                }

                face.textContent = String(faceResult.computed_value);
                item.appendChild(face);

                if (faceIndex < record.length - 1) {
                    const separator = document.createElement('span');
                    separator.className = 'roll-history-separator';
                    separator.textContent = '|';
                    item.appendChild(separator);
                }
            }

            const tricks = this.rollTrickHistory[index];
            if (tricks && tricks.length > 0) {
                const trickList = document.createElement('span');
                trickList.className = 'roll-history-tricks';
                trickList.textContent = tricks.join(', ');
                item.appendChild(trickList);
            }

            this.historyList.appendChild(item);
        }
    }

    private getRequiredElement<TElement extends HTMLElement>(id: string): TElement {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Missing required TB-04 DOM element: #${id}`);
        }

        return element as TElement;
    }
}
