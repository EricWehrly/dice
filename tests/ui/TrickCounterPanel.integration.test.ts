import { describe, expect, it, beforeEach } from 'vitest';
import Resource from '../../engine/js/entities/resource';
import { TrickEvaluator } from '../../src/game/tricks/TrickEvaluator';
import { TrickCounterPanel } from '../../src/ui/TrickCounterPanel';
import { ScoreProgressionTracker } from '../../src/game/score/ScoreProgressionTracker';
import { Bag } from '../../src/game/Bag';
import { initializeGameResources } from '../../src/game/resources/GameResources';

describe('TrickCounterPanel integration', () => {
    beforeEach(() => {
        (Resource as typeof Resource & { List?: Record<string, Resource> }).List = undefined;
    });

    it('renders live counter values from tracker resources', () => {
        document.body.innerHTML = `
            <div id="counter-grid"></div>
        `;

        initializeGameResources(0);
        new TrickEvaluator([]);
        const panel = new TrickCounterPanel();
        panel.render();

        const mods = Resource.Get('mods');
        const cosmetics = Resource.Get('cosmetics');
        if (!mods || !cosmetics) {
            throw new Error('Expected economy resources to be initialized');
        }

        mods.value += 1;
        cosmetics.value += 1;

        const counters = Array.from(document.querySelectorAll('#counter-grid .counter'));

        expect(counters).toHaveLength(3);
    });

    it('does not highlight counters on initial render', () => {
        document.body.innerHTML = `
            <div id="counter-grid"></div>
        `;

        const bag = new Bag();
        const initialHighScore = bag.getActiveDice().reduce((sum, die) => sum + die.faceCount, 0);
        initializeGameResources(initialHighScore);
        new ScoreProgressionTracker(bag);
        new TrickEvaluator([]);
        const panel = new TrickCounterPanel();
        panel.render();

        const counters = Array.from(document.querySelectorAll('#counter-grid .counter'));
        const highlighted = counters.filter((c) => c.classList.contains('counter--highlight'));

        expect(highlighted).toHaveLength(0);
    });

    it('highlights counter when incrementing after initial render', () => {
        document.body.innerHTML = `
            <div id="counter-grid"></div>
        `;

        initializeGameResources(0);
        new TrickEvaluator([]);
        const panel = new TrickCounterPanel();
        panel.render();

        const mods = Resource.Get('mods');
        if (!mods) {
            throw new Error('Expected mods resource to be initialized');
        }

        mods.value += 1;

        const counters = Array.from(document.querySelectorAll('#counter-grid .counter'));
        const modsCounter = counters[0];

        expect(modsCounter?.classList.contains('counter--highlight')).toBe(true);
    });
});
