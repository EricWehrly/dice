jest.mock('three');
import { RenderingContextManager, RenderingContextOptions } from '../../src/rendering/RenderingContext';

// Concrete implementation for testing
class TestRenderingContext extends RenderingContextManager {
    // constructor(options: RenderingContextOptions) {
    //     super(options);
    // }
}

describe('RenderingContext', () => {
    beforeEach(() => {
        // Reset the static fields between tests
        // (RenderingContextManager as any)._firstContext = null;
        // (RenderingContextManager as any)._contextsByName = {};
    });

    test('default options create unique instances', () => {
        const context1 = new TestRenderingContext({ name: 'test1' });
        const context2 = new TestRenderingContext({ name: 'test2' });

        // Verify scenes are different instances
        expect(context1.scene).not.toBe(context2.scene);
        
        // Verify renderers are different instances
        expect(context1.renderer).not.toBe(context2.renderer);
        
        // Verify cameras are different instances
        expect(context1.camera).not.toBe(context2.camera);
    });

    test('contexts with same name throw error', () => {
        new TestRenderingContext({ name: 'test' });
        expect(() => {
            new TestRenderingContext({ name: 'test' });
        }).toThrow('RenderingContext with name test already exists');
    });
});

