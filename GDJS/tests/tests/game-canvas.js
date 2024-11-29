describe('gdjs.RuntimeGameRenderer canvas tests', () => {
    it('should correctly create standard canvas and domElementsContainer', () => {
        const runtimeGame = gdjs.getPixiRuntimeGame({
            propertiesOverrides: {
                authorUsernames: ['HelperWesley'],
                projectUuid: 'project-uuid',
            },
        });

        const gameContainer = document.createElement('div');
        runtimeGame.getRenderer().createStandardCanvas(gameContainer);

        const gameCanvas = runtimeGame._gameCanvas;
        const domElementsContainer = runtimeGame._domElementsContainer;

        expect(gameCanvas).to.not.be(null);
        expect(domElementsContainer).to.not.be(null);
    });

    it('should correctly initialize external canvas and create domElementsContainer', () => {
        const runtimeGame = gdjs.getPixiRuntimeGame({
            propertiesOverrides: {
                authorUsernames: ['HelperWesley'],
                projectUuid: 'project-uuid',
            },
        });

        const gameContainer = document.createElement('div');
        const gameCanvas = document.createElement('canvas');
        gameContainer.appendChild(gameCanvas);
        runtimeGame.getRenderer().initializeForCanvas(gameCanvas);

        const expectedGameCanvas = runtimeGame._gameCanvas;
        const expectedDomElementsContainer = runtimeGame._domElementsContainer;

        expect(expectedGameCanvas).to.not.be(null);
        expect(expectedDomElementsContainer).to.not.be(null);
    });
});