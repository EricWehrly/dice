// Minimal mock helpers compatible with Vitest's `vi.fn()`
const makeFn = () => {
  function fn(...args) {
    fn.mock.calls.push(args);
    return (fn._impl) ? fn._impl(...args) : undefined;
  }
  fn.mock = { calls: [] };
  fn.mockImplementation = (impl) => { fn._impl = impl; return fn; };
  fn.mockReset = () => { fn._impl = undefined; fn.mock.calls = []; return fn; };
  return fn;
};

const THREE = {
    Scene: makeFn().mockImplementation(() => ({
        add: makeFn(),
        remove: makeFn(),
    })),
    PerspectiveCamera: makeFn().mockImplementation(() => ({
        position: { set: makeFn() },
        lookAt: makeFn(),
    })),
    WebGLRenderer: makeFn().mockImplementation(() => ({
        setSize: makeFn(),
        render: makeFn(),
    })),
    Mesh: makeFn().mockImplementation(() => ({
        geometry: {},
        children: [],
        position: { x: 0, y: 0, z: 0, set: makeFn() },
        rotation: { x: 0, y: 0, z: 0 },
        add: makeFn(),
    })),
    BoxGeometry: makeFn().mockImplementation(() => ({})),
    TetrahedronGeometry: makeFn().mockImplementation(() => ({})),
    OctahedronGeometry: makeFn().mockImplementation(() => ({})),
    DodecahedronGeometry: makeFn().mockImplementation(() => ({})),
    IcosahedronGeometry: makeFn().mockImplementation(() => ({})),
    MeshStandardMaterial: makeFn().mockImplementation(() => ({})),
    MeshBasicMaterial: makeFn().mockImplementation(() => ({})),
    SphereGeometry: makeFn().mockImplementation(() => ({})),
    Group: makeFn().mockImplementation(() => ({ add: makeFn(), children: [], position: { set: makeFn() } })),
    // Add other necessary mocks here
};

module.exports = THREE;