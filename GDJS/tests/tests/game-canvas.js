describe('gdjs.RuntimeGameRenderer canvas tests', () => {
    let runtimeGame;
    let renderer;
    let gameContainer;
    let restoreDevicePixelRatio;

    const setDevicePixelRatio = value => {
        const descriptor = Object.getOwnPropertyDescriptor(
            window,
            'devicePixelRatio'
        );
        Object.defineProperty(window, 'devicePixelRatio', {
            configurable: true,
            value,
        });

        return () => {
            if (descriptor) {
                Object.defineProperty(window, 'devicePixelRatio', descriptor);
            } else {
                delete window.devicePixelRatio;
            }
        };
    };

    beforeEach(() => {
        restoreDevicePixelRatio = null;
        runtimeGame = gdjs.getPixiRuntimeGame();
        renderer = runtimeGame.getRenderer();
        gameContainer = document.createElement('div');
    });

    afterEach(() => {
        if (restoreDevicePixelRatio) {
            restoreDevicePixelRatio();
        }
    });

    it('should correctly create standard canvas and domElementsContainer', () => {
        renderer.createStandardCanvas(gameContainer);

        const actualGameCanvas = renderer.getCanvas();
        const actualDomElementsContainer = renderer.getDomElementContainer();

        expect(actualGameCanvas).to.not.be(null);
        expect(actualDomElementsContainer).to.not.be(null);
        expect(actualGameCanvas.parentElement).to.be(gameContainer);
        expect(actualDomElementsContainer.parentElement).to.be(gameContainer);
    });

    it('should correctly initialize external canvas and create domElementsContainer', () => {
        const gameCanvas = document.createElement('canvas');
        gameContainer.appendChild(gameCanvas);
        renderer.initializeRenderers(gameCanvas);
        renderer.initializeCanvas(gameCanvas);

        const actualGameCanvas = renderer.getCanvas();
        const actualDomElementsContainer = renderer.getDomElementContainer();

        expect(actualGameCanvas).to.not.be(null);
        expect(actualDomElementsContainer).to.not.be(null);
        expect(actualGameCanvas).to.be(gameCanvas);
        expect(actualDomElementsContainer.parentElement).to.be(gameContainer);
    });

    it('should render the canvas with the device pixel ratio without scaling the scene', () => {
        restoreDevicePixelRatio = setDevicePixelRatio(2);

        renderer.createStandardCanvas(gameContainer);

        const actualGameCanvas = renderer.getCanvas();
        const actualPixiRenderer = renderer.getPIXIRenderer();
        const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
        const actualSceneContainer = runtimeScene
            .getRenderer()
            .getRendererObject();

        expect(actualGameCanvas).to.not.be(null);
        expect(actualPixiRenderer).to.not.be(null);
        expect(actualPixiRenderer.resolution).to.be(2);
        expect(actualPixiRenderer.width).to.be(
            runtimeGame.getGameResolutionWidth() * 2
        );
        expect(actualPixiRenderer.height).to.be(
            runtimeGame.getGameResolutionHeight() * 2
        );
        expect(actualPixiRenderer.screen.width).to.be(
            runtimeGame.getGameResolutionWidth()
        );
        expect(actualPixiRenderer.screen.height).to.be(
            runtimeGame.getGameResolutionHeight()
        );
        expect(actualGameCanvas.width).to.be(
            runtimeGame.getGameResolutionWidth() * 2
        );
        expect(actualGameCanvas.height).to.be(
            runtimeGame.getGameResolutionHeight() * 2
        );
        const initialCanvasCssWidth = actualGameCanvas.style.width;
        const initialCanvasCssHeight = actualGameCanvas.style.height;
        expect(parseFloat(initialCanvasCssWidth)).to.be.lessThan(
            actualGameCanvas.width
        );
        expect(parseFloat(initialCanvasCssHeight)).to.be.lessThan(
            actualGameCanvas.height
        );
        expect(actualSceneContainer.scale.x).to.be(1);
        expect(actualSceneContainer.scale.y).to.be(1);

        restoreDevicePixelRatio();
        restoreDevicePixelRatio = setDevicePixelRatio(1.5);

        renderer.updateRendererSize();
        runtimeScene.onGameResolutionResized();

        expect(actualPixiRenderer.resolution).to.be(1.5);
        expect(actualPixiRenderer.width).to.be(
            runtimeGame.getGameResolutionWidth() * 1.5
        );
        expect(actualPixiRenderer.height).to.be(
            runtimeGame.getGameResolutionHeight() * 1.5
        );
        expect(actualPixiRenderer.screen.width).to.be(
            runtimeGame.getGameResolutionWidth()
        );
        expect(actualPixiRenderer.screen.height).to.be(
            runtimeGame.getGameResolutionHeight()
        );
        expect(actualGameCanvas.width).to.be(
            runtimeGame.getGameResolutionWidth() * 1.5
        );
        expect(actualGameCanvas.height).to.be(
            runtimeGame.getGameResolutionHeight() * 1.5
        );
        expect(actualGameCanvas.style.width).to.be(initialCanvasCssWidth);
        expect(actualGameCanvas.style.height).to.be(initialCanvasCssHeight);
        expect(actualSceneContainer.scale.x).to.be(1);
        expect(actualSceneContainer.scale.y).to.be(1);
    });

    it('should remove canvas and domElementsContainer on dispose', () => {
        renderer.createStandardCanvas(gameContainer);

        const actualGameCanvas = renderer.getCanvas();
        const actualDomElementsContainer = renderer.getDomElementContainer();

        expect(actualGameCanvas).to.not.be(null);
        expect(actualDomElementsContainer).to.not.be(null);
        expect(actualGameCanvas.parentElement).to.be(gameContainer);
        expect(actualDomElementsContainer.parentElement).to.be(gameContainer);

        runtimeGame.dispose(true);

        const actualGameCanvasAfterDispose = renderer.getCanvas();
        const actualDomElementsContainerAfterDispose = renderer.getDomElementContainer();

        expect(actualGameCanvasAfterDispose).to.be(null);
        expect(actualDomElementsContainerAfterDispose).to.be(null);

        expect(gameContainer.childNodes.length).to.be(0);
    });
});
