import { describe, expect, it } from 'vitest';
import { Bag } from '../../src/game/Bag';
import { ScoreProgressionTracker } from '../../src/game/score/ScoreProgressionTracker';
import { ScorePanel } from '../../src/ui/ScorePanel';

describe('ScorePanel integration', () => {
    it('renders high score updates in dedicated panel', () => {
        document.body.innerHTML = '<div id="score-panel"></div>';

        const bag = new Bag();
        const tracker = new ScoreProgressionTracker(bag);
        const panel = new ScorePanel();
        panel.render();

        tracker.observeRoll([2, 2, 2]);
        expect(document.getElementById('score-panel')?.textContent).toBe('High Score: 6');

        tracker.observeRoll([1, 1, 1]);
        expect(document.getElementById('score-panel')?.textContent).toBe('High Score: 6');

        tracker.observeRoll([6, 6, 6]);
        expect(document.getElementById('score-panel')?.textContent).toBe('High Score: 18');
    });
});
