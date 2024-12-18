describe('gdjs.RuntimeGameRenderer canvas tests', () => {
    let runtimeGame;
    let renderer;
    let gameContainer;

    beforeEach(() => {
        runtimeGame = gdjs.getPixiRuntimeGame();
        renderer = runtimeGame.getRenderer();
        gameContainer = document.createElement('div');
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