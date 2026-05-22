// Minimal DOM and crypto shims for test environment
// This will run before tests and before source imports

// Ensure global window exists (in case an import reads it at module-eval)
if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = globalThis;
}

// Load the engine's authoritative test setup (prefer compiled .js, fall back to .ts)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../engine/test/vitest.setup.js');
} catch (e) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../engine/test/vitest.setup.ts');
  } catch (e2) {
    // if not present, continue; minimal fallbacks below will keep tests working
  }
}

// Provide a minimal crypto.getRandomValues used by engine utilities (fallback only)
if (!(globalThis as any).crypto) {
  (globalThis as any).crypto = {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
      return arr;
    }
  };
}

// Provide requestAnimationFrame when not available (fallback only)
if (typeof (globalThis as any).requestAnimationFrame === 'undefined') {
  (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 16) as unknown as number;
}

// Ensure jsdom environment basics
if (!(globalThis as any).document) {
  (globalThis as any).document = (globalThis as any).window.document;
}

// Ensure global.fail exists as a small convenience for migrated tests
if (typeof (globalThis as any).fail === 'undefined') {
  (globalThis as any).fail = (msg?: string): never => { throw new Error(msg || 'Failed'); };
}
