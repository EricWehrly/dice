import { describe, expect, it } from 'vitest';
import Resource from '../../../engine/js/entities/resource';
import { TrickEvaluator } from '../../../src/game/tricks/TrickEvaluator';

describe('TrickCounterTracker', () => {
    beforeEach(() => {
        (Resource as typeof Resource & { List?: Record<string, Resource> }).List = undefined;
    });

    it('increments earned values through Resource-backed flow', () => {
        new TrickEvaluator([]);

        const mods = Resource.Get('mods');
        const cosmetics = Resource.Get('cosmetics');
        if (!mods || !cosmetics) {
            throw new Error('Expected economy resources to be initialized');
        }

        mods.value += 1;
        cosmetics.value += 1;

        expect(mods.value).toBe(1);
        expect(cosmetics.value).toBe(1);
    });

    it('does not reset listed resources when economy setup runs again', () => {
        new TrickEvaluator([]);
        const mods = Resource.Get('mods');
        if (!mods) {
            throw new Error('Expected mods resource to exist');
        }

        mods.value += 1;
        expect(mods.value).toBe(1);

        new TrickEvaluator([]);

        expect(Resource.Get('mods')?.value).toBe(1);
    });
});
