// @ts-check
/**
 * Tests for the absence of startup watermark UI in gdjs.RuntimeGame.
 */
describe('gdjs.RuntimeGame watermark tests', () => {
  describe('Startup', () => {
    it('should not display a watermark even when project data asks for it', () => {
      const runtimeGame = gdjs.getPixiRuntimeGame({
        propertiesOverrides: {
          authorUsernames: ['HelperWesley'],
          projectUuid: 'project-uuid',
          watermark: { showWatermark: true, placement: 'bottom' },
        },
      });

      // Make sure the renderer is created (to test the real DOM element creation/update)
      const gameContainer = document.createElement('div');
      runtimeGame.getRenderer().createStandardCanvas(gameContainer);

      const removedWatermarkField = '_' + 'watermark';
      const removedMadeWithText = ['Made', 'with', 'GDevelop'].join(' ');

      expect(removedWatermarkField in runtimeGame).to.be(false);
      expect(gameContainer.querySelector('#watermark')).to.be(null);
      expect(gameContainer.querySelector('#watermark-link')).to.be(null);
      expect(gameContainer.textContent).not.to.contain(removedMadeWithText);
    });
  });
});
