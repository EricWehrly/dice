import Events from '../../engine/js/events';
import Resource from '../../engine/js/entities/resource';
import type { ResourceChangedEvent } from '../../engine/js/entities/resource';

const economyResources = ['mods', 'cosmetics'] as const;
type EconomyResourceName = typeof economyResources[number];

export class TrickCounterPanel {
    private readonly counterGrid: HTMLDivElement;
    private readonly counterElements: Record<EconomyResourceName, HTMLDivElement>;

    constructor() {
        this.counterGrid = this.getRequiredElement<HTMLDivElement>('counter-grid');
        this.counterElements = this.buildCounterElements();

        Events.Subscribe<ResourceChangedEvent>(Events.List.ResourceValueChanged, this.render.bind(this));
    }

    render(): void {
        for (const resourceName of economyResources) {
            const earned = Resource.Get(resourceName)?.value || 0;
            this.counterElements[resourceName].textContent = `${resourceName} Earned: ${earned}`;
        }
    }

    private buildCounterElements(): Record<EconomyResourceName, HTMLDivElement> {
        const counterElements = {} as Record<EconomyResourceName, HTMLDivElement>;
        this.counterGrid.innerHTML = '';

        for (const resourceName of economyResources) {
            const element = document.createElement('div');
            element.className = 'counter';
            this.counterGrid.appendChild(element);
            counterElements[resourceName] = element;
        }

        return counterElements;
    }

    private getRequiredElement<TElement extends HTMLElement>(id: string): TElement {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Missing required TB-02 DOM element: #${id}`);
        }

        return element as TElement;
    }
}