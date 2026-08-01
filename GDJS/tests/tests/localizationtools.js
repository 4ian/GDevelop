describe('gdjs.evtTools.localization', function () {
  it('initializes and changes the locale independently for each game', () => {
    const firstGame = gdjs.getPixiRuntimeGame();
    const secondGame = gdjs.getPixiRuntimeGame();
    const firstScene = new gdjs.RuntimeScene(firstGame);
    const secondScene = new gdjs.RuntimeScene(secondGame);
    const defaultLocale = navigator.language || 'en';

    expect(gdjs.evtTools.localization.getLocale(firstScene)).to.be(
      defaultLocale
    );
    expect(gdjs.evtTools.localization.getLocale(secondScene)).to.be(
      defaultLocale
    );

    gdjs.evtTools.localization.setLocale(firstScene, 'fr-FR');

    expect(gdjs.evtTools.localization.getLocale(firstScene)).to.be('fr-FR');
    expect(gdjs.evtTools.localization.getLocale(secondScene)).to.be(
      defaultLocale
    );
  });
});
