// @ts-check
/**
 * Test for gdjs.RuntimeWatermark
 */
describe('gdjs.RuntimeWatermark integration tests', () => {
  describe('Timeline', () => {
    const watermarkDisplayDelay = 1000;
    const displayDuration = 20000;
    const changeTextDelay = 7000;
    const fadeTransitionDuration = 300;

    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers();
    });

    afterEach(() => {
      clock.restore();
    });

    it('should correctly display elements in the right order (with username)', () => {
      const runtimeGame = gdjs.getPixiRuntimeGame({
        propertiesOverrides: {
          authorUsernames: ['HelperWesley'],
          projectUuid: 'project-uuid',
        },
      });

      // Make sure the renderer is created (to test the real DOM element creation/update)
      const gameContainer = document.createElement('div');
      runtimeGame.getRenderer().createStandardCanvas(gameContainer);

      const watermark = runtimeGame._watermark;

      expect(watermark._backgroundElement).to.be(null);
      expect(watermark._containerElement).to.be(null);

      // Prevent calling runtimeGame.startGameLoop so manually display the
      // watermark
      watermark.displayAtStartup();

      // Apply offset of 50ms to prevent having test checks done when
      // js computations are not done yet
      clock.tick(50);

      // All elements are added
      if (
        !watermark._linkElement ||
        !watermark._containerElement ||
        !watermark._backgroundElement ||
        !watermark._usernameTextElement ||
        !watermark._madeWithTextElement ||
        !watermark._svgElement
      )
        throw new Error('Watermark DOM elements could not be found.');
      expect(watermark._linkElement.href).to.be(
        'https://gd.games/HelperWesley?utm_source=gdevelop-game&utm_medium=game-watermark&utm_campaign=project-uuid'
      );
      expect(watermark._containerElement.style.opacity).to.be('0');
      expect(watermark._backgroundElement.style.opacity).to.be('0');
      expect(watermark._usernameTextElement.style.opacity).to.be('0');
      expect(watermark._usernameTextElement.innerHTML).to.be('@HelperWesley');

      clock.tick(watermarkDisplayDelay);

      // Watermark fade-in
      expect(watermark._backgroundElement.style.opacity).to.be('1');
      expect(watermark._containerElement.style.opacity).to.be('1');
      expect(watermark._linkElement.style.pointerEvents).to.be('all');

      // Logo is spinning
      expect(watermark._svgElement.classList.contains('spinning')).to.be(true);

      clock.tick(changeTextDelay);

      // Made with GDevelop starts to fade out
      expect(watermark._madeWithTextElement.style.opacity).to.be('0');

      clock.tick(fadeTransitionDuration);

      // Username starts to fade in and Made with GDevelop takes no space
      expect(watermark._usernameTextElement.style.opacity).to.be('1');
      expect(watermark._madeWithTextElement.style.lineHeight).to.be('0');

      const delta = 200;
      const justBeforeWatermarkDisappears =
        displayDuration - changeTextDelay - fadeTransitionDuration - delta;

      clock.tick(justBeforeWatermarkDisappears);

      // Make sure the watermark is still displayed
      expect(watermark._usernameTextElement.style.opacity).to.be('1');
      expect(watermark._backgroundElement.style.opacity).to.be('1');
      expect(watermark._containerElement.style.opacity).to.be('1');
      expect(watermark._containerElement.style.display).to.be('');
      expect(watermark._backgroundElement.style.display).to.be('');

      clock.tick(delta);

      // Watermark starts to fade out
      expect(watermark._backgroundElement.style.opacity).to.be('0');
      expect(watermark._containerElement.style.opacity).to.be('0');

      clock.tick(fadeTransitionDuration);

      // Watermark loses all interaction possibilities
      expect(watermark._containerElement.style.display).to.be('none');
      expect(watermark._linkElement.style.pointerEvents).to.be('none');
      expect(watermark._backgroundElement.style.display).to.be('none');
    });

    it('should correctly display elements in the right order (without username)', () => {
      const runtimeGame = gdjs.getPixiRuntimeGame({
        propertiesOverrides: {
          authorUsernames: [],
          projectUuid: 'project-uuid',
        },
      });

      // Make sure the renderer is created (to test the real DOM element creation/update)
      const gameContainer = document.createElement('div');
      runtimeGame.getRenderer().createStandardCanvas(gameContainer);

      const watermark = runtimeGame._watermark;

      expect(watermark._backgroundElement).to.be(null);
      expect(watermark._containerElement).to.be(null);

      // Prevent calling runtimeGame.startGameLoop so manually display the
      // watermark
      watermark.displayAtStartup();

      // Apply offset of 50ms to prevent having test checks done when
      // js computations are not done yet
      clock.tick(50);

      // All elements are added
      if (
        !watermark._linkElement ||
        !watermark._containerElement ||
        !watermark._backgroundElement ||
        !watermark._madeWithTextElement ||
        !watermark._svgElement
      )
        throw new Error('Watermark DOM elements could not be found.');

      expect(watermark._linkElement.href).to.be(
        'https://gd.games/?utm_source=gdevelop-game&utm_medium=game-watermark&utm_campaign=project-uuid'
      );
      expect(watermark._containerElement.style.opacity).to.be('0');
      expect(watermark._backgroundElement.style.opacity).to.be('0');
      // Username text element should not exist
      expect(watermark._usernameTextElement).to.be(null);

      clock.tick(watermarkDisplayDelay);

      // Watermark fade-in
      expect(watermark._backgroundElement.style.opacity).to.be('1');
      expect(watermark._containerElement.style.opacity).to.be('1');
      expect(watermark._linkElement.style.pointerEvents).to.be('all');
      // Logo is spinning
      expect(watermark._svgElement.classList.contains('spinning')).to.be(true);

      const delta = 200;
      const justBeforeWatermarkDisappears = displayDuration - delta;

      clock.tick(justBeforeWatermarkDisappears);

      // Make sure the watermark is still displayed
      expect(watermark._usernameTextElement).to.be(null);
      expect(watermark._madeWithTextElement.style.lineHeight).to.be('');
      expect(watermark._madeWithTextElement.style.opacity).not.to.be('0');
      expect(watermark._backgroundElement.style.opacity).to.be('1');
      expect(watermark._containerElement.style.opacity).to.be('1');
      expect(watermark._containerElement.style.display).to.be('');
      expect(watermark._backgroundElement.style.display).to.be('');

      clock.tick(delta);

      // Watermark starts to fade out
      expect(watermark._backgroundElement.style.opacity).to.be('0');
      expect(watermark._containerElement.style.opacity).to.be('0');

      clock.tick(fadeTransitionDuration);

      // Watermark loses all interaction possibilities
      expect(watermark._containerElement.style.display).to.be('none');
      expect(watermark._linkElement.style.pointerEvents).to.be('none');
      expect(watermark._backgroundElement.style.display).to.be('none');
    });
  });
});
