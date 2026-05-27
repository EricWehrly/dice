import { beforeEach, describe, expect, it, vi } from 'vitest';
import Events from '../../engine/js/events';
import { ModifiedDie } from '../../src/game/ModifiedDie';
import { TrickEvents } from '../../src/game/contracts/TrickContracts';
import { DieModificationPanel } from '../../src/ui/DieModificationPanel';

function installCanvasMocks(): void {
    const context = {
        setTransform: vi.fn(),
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        arc: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn((text: string) => ({ width: text.length * 7 })),
        fillStyle: '#000',
        strokeStyle: '#000',
        shadowColor: 'transparent',
        shadowBlur: 0,
        shadowOffsetY: 0,
        globalAlpha: 1,
        lineWidth: 1,
        font: '10px sans-serif',
        textAlign: 'center',
        textBaseline: 'middle',
    } as unknown as CanvasRenderingContext2D;

    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
        value: vi.fn(() => context),
        configurable: true,
    });

    Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
        value: vi.fn(() => ({
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            width: 240,
            height: 140,
            right: 240,
            bottom: 140,
            toJSON: () => ({}),
        })),
        configurable: true,
    });
}

function getRequired<T extends Element>(selector: string): T {
    const element = document.querySelector(selector);
    if (!element) {
        throw new Error(`Element not found: ${selector}`);
    }

    return element as T;
}

describe('DieModificationPanel integration', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        installCanvasMocks();
        document.body.innerHTML = '<div id="die-mod-panel"></div>';
    });

    it('installs and replaces weight mod target through panel install flow', () => {
        const die = new ModifiedDie({ id: 'die-1', faceCount: 6 });
        const panel = new DieModificationPanel([die]);
        const bagChangedSpy = vi.fn();
        const subscriptionId = Events.Subscribe(TrickEvents.BAG_CHANGED, bagChangedSpy);

        panel.render();

        const coreModSelector = getRequired<HTMLSelectElement>('.die-mod-core-mod-selector');
        coreModSelector.value = 'weight-1.5';
        coreModSelector.dispatchEvent(new Event('change', { bubbles: true }));

        let targetSelector = getRequired<HTMLSelectElement>('.die-mod-target-face-selector');
        targetSelector.value = '2';
        targetSelector.dispatchEvent(new Event('change', { bubbles: true }));

        let installBtn = getRequired<HTMLButtonElement>('.die-mod-install-btn');
        installBtn.click();

        expect(die.mod).toMatchObject({ faceIndex: 2, grams: 1.5, id: 'weight-1.5' });

        targetSelector = getRequired<HTMLSelectElement>('.die-mod-target-face-selector');
        targetSelector.value = '4';
        targetSelector.dispatchEvent(new Event('change', { bubbles: true }));

        installBtn = getRequired<HTMLButtonElement>('.die-mod-install-btn');
        installBtn.click();

        expect(die.mod).toMatchObject({ faceIndex: 4, grams: 1.5, id: 'weight-1.5' });
        expect(bagChangedSpy).toHaveBeenCalledTimes(2);

        if (subscriptionId) {
            Events.Unsubscribe(subscriptionId);
        }
    });

    it('uninstalls when selecting none and clears pending selection state', () => {
        const die = new ModifiedDie({ id: 'die-2', faceCount: 6 });
        const panel = new DieModificationPanel([die]);
        const bagChangedSpy = vi.fn();
        const subscriptionId = Events.Subscribe(TrickEvents.BAG_CHANGED, bagChangedSpy);

        panel.render();

        const coreModSelector = getRequired<HTMLSelectElement>('.die-mod-core-mod-selector');
        coreModSelector.value = 'weight-2.0';
        coreModSelector.dispatchEvent(new Event('change', { bubbles: true }));

        const targetSelector = getRequired<HTMLSelectElement>('.die-mod-target-face-selector');
        targetSelector.value = '3';
        targetSelector.dispatchEvent(new Event('change', { bubbles: true }));

        getRequired<HTMLButtonElement>('.die-mod-install-btn').click();
        expect(die.mod).not.toBeNull();

        const refreshedCoreSelector = getRequired<HTMLSelectElement>('.die-mod-core-mod-selector');
        refreshedCoreSelector.value = 'none';
        refreshedCoreSelector.dispatchEvent(new Event('change', { bubbles: true }));

        const refreshedTargetSelector = getRequired<HTMLSelectElement>('.die-mod-target-face-selector');
        const refreshedInstallBtn = getRequired<HTMLButtonElement>('.die-mod-install-btn');

        expect(refreshedInstallBtn.disabled).toBe(false);
        expect(refreshedInstallBtn.textContent?.trim()).toBe('Uninstall');

        refreshedInstallBtn.click();

        const finalInstallBtn = getRequired<HTMLButtonElement>('.die-mod-install-btn');

        expect(die.mod).toBeNull();
        expect(refreshedTargetSelector.disabled).toBe(true);
        expect(finalInstallBtn.disabled).toBe(true);
        expect(finalInstallBtn.textContent?.trim()).toBe('Install');
        expect(bagChangedSpy).toHaveBeenCalledTimes(2);

        if (subscriptionId) {
            Events.Unsubscribe(subscriptionId);
        }
    });

    it('clears pending selection without changing die state when none selected before install', () => {
        const die = new ModifiedDie({ id: 'die-3', faceCount: 6 });
        const panel = new DieModificationPanel([die]);
        const bagChangedSpy = vi.fn();
        const subscriptionId = Events.Subscribe(TrickEvents.BAG_CHANGED, bagChangedSpy);

        panel.render();

        const coreModSelector = getRequired<HTMLSelectElement>('.die-mod-core-mod-selector');
        coreModSelector.value = 'weight-1.0';
        coreModSelector.dispatchEvent(new Event('change', { bubbles: true }));

        const targetSelector = getRequired<HTMLSelectElement>('.die-mod-target-face-selector');
        targetSelector.value = '1';
        targetSelector.dispatchEvent(new Event('change', { bubbles: true }));

        const refreshedCoreSelector = getRequired<HTMLSelectElement>('.die-mod-core-mod-selector');
        refreshedCoreSelector.value = 'none';
        refreshedCoreSelector.dispatchEvent(new Event('change', { bubbles: true }));

        const refreshedTargetSelector = getRequired<HTMLSelectElement>('.die-mod-target-face-selector');
        const refreshedInstallBtn = getRequired<HTMLButtonElement>('.die-mod-install-btn');

        expect(die.mod).toBeNull();
        expect(refreshedTargetSelector.disabled).toBe(true);
        expect(refreshedInstallBtn.disabled).toBe(true);
        expect(refreshedInstallBtn.textContent?.trim()).toBe('Install');
        expect(bagChangedSpy).not.toHaveBeenCalled();

        if (subscriptionId) {
            Events.Unsubscribe(subscriptionId);
        }
    });
});
