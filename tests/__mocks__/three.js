const THREE = {
    Scene: jest.fn().mockImplementation(() => ({
        add: jest.fn(),
        remove: jest.fn(),
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
        position: { set: jest.fn() },
        lookAt: jest.fn(),
    })),
    WebGLRenderer: jest.fn().mockImplementation(() => ({
        setSize: jest.fn(),
        render: jest.fn(),
    })),
    Mesh: jest.fn().mockImplementation(() => ({
        geometry: {},
        children: [],
        position: { x: 0, y: 0, z: 0, set: jest.fn() },
        rotation: { x: 0, y: 0, z: 0 },
        add: jest.fn(),
    })),
    BoxGeometry: jest.fn().mockImplementation(() => ({})),
    TetrahedronGeometry: jest.fn().mockImplementation(() => ({})),
    OctahedronGeometry: jest.fn().mockImplementation(() => ({})),
    DodecahedronGeometry: jest.fn().mockImplementation(() => ({})),
    IcosahedronGeometry: jest.fn().mockImplementation(() => ({})),
    MeshStandardMaterial: jest.fn().mockImplementation(() => ({})),
    MeshBasicMaterial: jest.fn().mockImplementation(() => ({})),
    SphereGeometry: jest.fn().mockImplementation(() => ({})),
    Group: jest.fn().mockImplementation(() => ({ add: jest.fn(), children: [], position: { set: jest.fn() } })),
    // Add other necessary mocks here
};

module.exports = THREE;