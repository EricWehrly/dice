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
    // Add other necessary mocks here
};

module.exports = THREE;