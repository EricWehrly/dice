import { describe, expect, it } from 'vitest';
import { Trick } from '../../src/game/tricks';
import { TrickEvaluator } from '../../src/game/tricks/TrickEvaluator';
import { TrickPanel } from '../../src/ui/TrickPanel';

// Import real trick modules so their default instances self-register through Listed.
import '../../src/game/tricks/OfAKind';
import '../../src/game/tricks/Ascending';
import '../../src/game/tricks/Primes';

describe('TrickPanel integration', () => {
  it('renders real registered tricks and updates from TrickEvaluator result events', () => {
    document.body.innerHTML = '<ul id="trick-list"></ul>';

    const evaluator = new TrickEvaluator();
    const panel = new TrickPanel();
    panel.render();
    evaluator.evaluateRoll([2, 2, 2]);

    const listedTricks = Trick.GetAll<Trick>();
    const itemTitles = Array.from(document.querySelectorAll('.trick-title')).map((node) => node.textContent);
    const metaValues = Array.from(document.querySelectorAll('.trick-meta')).map((node) => node.textContent);

    expect(itemTitles).toContain('Of a Kind');
    expect(itemTitles).toContain('Ascending');
    expect(itemTitles).toContain('Primes');
    expect(itemTitles.length).toBe(listedTricks.length);
    expect(metaValues.some((value) => value?.includes('hit'))).toBe(true);
  });
});
