import { InputManager } from '../../src/controls/InputManager';
import { init } from '../../src/thrower/index';
import { createCubeAtCursor } from '../../src/thrower/input';
import { initThrowPathFollower } from '../../src/thrower/ThrowPathFollower';
import { attachContextMenuListener } from '../../src/ui/GameObjectInspector';
import ThreeJSRenderContext from '../../engine/js/rendering/contexts/ThreeJS.RenderContext';

vi.mock('../../src/thrower/input', () => ({
  createCubeAtCursor: vi.fn()
}));

vi.mock('../../src/thrower/ThrowPathFollower', () => ({
  initThrowPathFollower: vi.fn()
}));

vi.mock('../../src/ui/GameObjectInspector', () => ({
  attachContextMenuListener: vi.fn()
}));

vi.mock('../../engine/js/rendering/contexts/ThreeJS.RenderContext', () => {
  const canvas = document.createElement('canvas');
  return {
    default: {
      Instance: {
        camera: {},
        scene: {},
        canvas
      }
    }
  };
});

describe('thrower init', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    InputManager.Instance.reset();
  });

  test('wires engine + listeners and blocks throws when cooldown gate fails', () => {
    const canvasAddEventListenerSpy = vi.spyOn(ThreeJSRenderContext.Instance.canvas, 'addEventListener');
    const windowAddEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const canThrowSpy = vi.spyOn(InputManager.Instance, 'canThrow').mockReturnValue(false);
    const recordThrowSpy = vi.spyOn(InputManager.Instance, 'recordThrow');

    init();

    expect(initThrowPathFollower).toHaveBeenCalledTimes(1);
    expect(attachContextMenuListener).toHaveBeenCalledTimes(1);
    expect(canvasAddEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    expect(windowAddEventListenerSpy).not.toHaveBeenCalledWith('mouseup', expect.any(Function));

    const mouseupHandler = canvasAddEventListenerSpy.mock.calls.find(([evt]) => evt === 'mouseup')?.[1] as EventListener;
    expect(mouseupHandler).toBeDefined();

    mouseupHandler({ target: ThreeJSRenderContext.Instance.canvas } as unknown as MouseEvent);

    expect(canThrowSpy).toHaveBeenCalledTimes(1);
    expect(recordThrowSpy).not.toHaveBeenCalled();
    expect(createCubeAtCursor).not.toHaveBeenCalled();

    canvasAddEventListenerSpy.mockRestore();
    windowAddEventListenerSpy.mockRestore();
  });

  test('records and dispatches throw when cooldown gate passes', () => {
    const canvasAddEventListenerSpy = vi.spyOn(ThreeJSRenderContext.Instance.canvas, 'addEventListener');
    vi.spyOn(InputManager.Instance, 'canThrow').mockReturnValue(true);
    const recordThrowSpy = vi.spyOn(InputManager.Instance, 'recordThrow');

    init();

    const mouseupHandler = canvasAddEventListenerSpy.mock.calls.find(([evt]) => evt === 'mouseup')?.[1] as EventListener;
    expect(mouseupHandler).toBeDefined();

    mouseupHandler({ target: ThreeJSRenderContext.Instance.canvas } as unknown as MouseEvent);

    expect(recordThrowSpy).toHaveBeenCalledTimes(1);
    expect(createCubeAtCursor).toHaveBeenCalledTimes(1);

    canvasAddEventListenerSpy.mockRestore();
  });

  test('ignores mouseup events whose target is not the 3D canvas', () => {
    const canvasAddEventListenerSpy = vi.spyOn(ThreeJSRenderContext.Instance.canvas, 'addEventListener');
    const canThrowSpy = vi.spyOn(InputManager.Instance, 'canThrow').mockReturnValue(true);
    const recordThrowSpy = vi.spyOn(InputManager.Instance, 'recordThrow');

    init();

    const mouseupHandler = canvasAddEventListenerSpy.mock.calls.find(([evt]) => evt === 'mouseup')?.[1] as EventListener;
    expect(mouseupHandler).toBeDefined();

    mouseupHandler({ target: document.createElement('div') } as unknown as MouseEvent);

    expect(canThrowSpy).not.toHaveBeenCalled();
    expect(recordThrowSpy).not.toHaveBeenCalled();
    expect(createCubeAtCursor).not.toHaveBeenCalled();

    canvasAddEventListenerSpy.mockRestore();
  });
});
