import { describe, expect, it } from 'vitest';
import Resource from '../../engine/js/entities/resource';
import { TrickEvaluator } from '../../src/game/tricks/TrickEvaluator';
import { TrickCounterPanel } from '../../src/ui/TrickCounterPanel';

describe('TrickCounterPanel integration', () => {
    beforeEach(() => {
        (Resource as typeof Resource & { List?: Record<string, Resource> }).List = undefined;
    });

    it('renders live counter values from tracker resources', () => {
        document.body.innerHTML = `
            <div id="counter-grid"></div>
        `;

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
});