import Events from '../../engine/js/events';
import Resource from '../../engine/js/entities/resource';
import type { ResourceChangedEvent } from '../../engine/js/entities/resource';

const economyResources = ['mods', 'cosmetics', 'high_score'] as const;
type EconomyResourceName = typeof economyResources[number];

// TODO: Structure icons with resource definitions somewhere
const economyResourceDisplay: Record<EconomyResourceName, { icon: string; label: string }> = {
    mods: { icon: '\u2699', label: 'Mods' },
    cosmetics: { icon: '\u{1F58C}', label: 'Customizations' },
    high_score: { icon: '\u25cc', label: 'High Score' },
};

export class TrickCounterPanel {
    private readonly counterGrid: HTMLDivElement;
    private readonly counterElements: Record<EconomyResourceName, HTMLDivElement>;
    private readonly previousValues: Record<EconomyResourceName, number> = { mods: 0, cosmetics: 0, high_score: 0 };

    constructor() {
        this.counterGrid = this.getRequiredElement<HTMLDivElement>('counter-grid');
        this.counterElements = this.buildCounterElements();

        Events.Subscribe<ResourceChangedEvent>(Events.List.ResourceValueChanged, this.render.bind(this));
    }

    render(): void {
        for (const resourceName of economyResources) {
            const earned = Resource.Get(resourceName)?.value || 0;
            const increased = earned > this.previousValues[resourceName];
            const display = economyResourceDisplay[resourceName];
            
            if (increased) {
                this.counterElements[resourceName].classList.remove('counter--highlight');
                // Trigger reflow to restart animation
                void this.counterElements[resourceName].offsetWidth;
                this.counterElements[resourceName].classList.add('counter--highlight');
            }
            
            this.counterElements[resourceName].textContent = `${display.icon} ${display.label}: ${earned}`;
            this.previousValues[resourceName] = earned;
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