import { Bag } from './game/Bag';
import { DiceCanvasRenderer } from './rendering/2d/DiceCanvasRenderer';

const rollButton = document.getElementById('roll-btn') as HTMLButtonElement | null;

if (!rollButton) {
    throw new Error('Missing required TB-01 DOM elements');
}

const bag = new Bag();
new DiceCanvasRenderer(bag);

// TODO: handle in managed UI instead
rollButton.addEventListener('click', () => {
    bag.rollAll();
});
