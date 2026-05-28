import Events from '../../engine/js/events';
import Resource from '../../engine/js/entities/resource';
import type { ResourceChangedEvent } from '../../engine/js/entities/resource';
import { ResourceNames } from '../game/resources/GameResources';

export class TrickCounterPanel {
    private readonly counterGrid: HTMLDivElement;
    private readonly counterElements: Map<string, HTMLDivElement>;
    private readonly previousValues: Map<string, number>;
    private readonly observedResources: Set<string> = new Set();

    constructor() {
        this.counterGrid = this.getRequiredElement<HTMLDivElement>('counter-grid');
        const resourceNames = Object.values(ResourceNames);
        this.previousValues = new Map(resourceNames.map((name) => [name, 0]));
        this.counterElements = this.buildCounterElements();

        Events.Subscribe<ResourceChangedEvent>(Events.List.ResourceValueChanged, this.render.bind(this));
    }

    render(): void {
        for (const resourceName of Object.values(ResourceNames)) {
            const resource = Resource.Get(resourceName);
            const earned = resource?.value || 0;
            const previous = this.previousValues.get(resourceName) ?? 0;
            const isFirstObservation = !this.observedResources.has(resourceName);
            const increased = earned > previous && !isFirstObservation;
            const icon = resource?.icon || '';
            const label = resource?.name || resourceName;
            const counterElement = this.counterElements.get(resourceName);
            if (!counterElement) {
                continue;
            }
            
            if (increased) {
                counterElement.classList.remove('counter--highlight');
                // Trigger reflow to restart animation
                void counterElement.offsetWidth;
                counterElement.classList.add('counter--highlight');
            }
            
            counterElement.textContent = `${icon} ${label}: ${earned}`;
            this.previousValues.set(resourceName, earned);
            this.observedResources.add(resourceName);
        }
    }

    private buildCounterElements(): Map<string, HTMLDivElement> {
        const counterElements = new Map<string, HTMLDivElement>();
        this.counterGrid.innerHTML = '';

        for (const resourceName of Object.values(ResourceNames)) {
            const element = document.createElement('div');
            element.className = 'counter';
            this.counterGrid.appendChild(element);
            counterElements.set(resourceName, element);
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