import { InputManager } from '../../src/controls/InputManager';

describe('InputManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    InputManager.Instance.reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('cooldown prevents immediate subsequent throws', () => {
    const mgr = InputManager.Instance;
    expect(mgr.canThrow()).toBe(true);

    mgr.recordThrow();
    expect(mgr.canThrow()).toBe(false);

    // advance time by 2.1s
    vi.advanceTimersByTime(2100);
    expect(mgr.canThrow()).toBe(true);
  });

  test('cannot throw when inspecting', () => {
    const mgr = InputManager.Instance;
    mgr.setInspecting(true);
    expect(mgr.canThrow()).toBe(false);
    mgr.setInspecting(false);
    expect(mgr.canThrow()).toBe(true);
  });
});