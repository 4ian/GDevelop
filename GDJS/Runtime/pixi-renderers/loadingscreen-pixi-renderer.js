gdjs.LoadingScreenPixiRenderer = function(runtimeGamePixiRenderer, loadingScreenSetup) {
  this._pixiRenderer = runtimeGamePixiRenderer.getPIXIRenderer();
  this._loadingScreen = new PIXI.Container();

  this._progressText = new PIXI.Text(' ', {
    font: '30px Arial',
    fill: '#FFFFFF',
    align: 'center',
  });
  this._loadingScreen.addChild(this._progressText);

  if (loadingScreenSetup && loadingScreenSetup.showGDevelopSplash) {
    this._madeWithText = new PIXI.Text('Made with', {
      font: '30px Arial',
      fill: '#FFFFFF',
      align: 'center',
    });
    this._madeWithText.position.y = this._pixiRenderer.height / 2 - 130;
    this._websiteText = new PIXI.Text('gdevelop-app.com', {
      font: '30px Arial',
      fill: '#FFFFFF',
      align: 'center',
    });
    this._websiteText.position.y = this._pixiRenderer.height / 2 + 100;

    this._splashImage = new PIXI.Sprite.fromImage(gdjs.splashImage);
    this._splashImage.position.x = this._pixiRenderer.width / 2;
    this._splashImage.position.y = this._pixiRenderer.height / 2;
    this._splashImage.anchor.x = 0.5;
    this._splashImage.anchor.y = 0.5;
    this._splashImage.scale.x = this._pixiRenderer.width / 800;
    this._splashImage.scale.y = this._pixiRenderer.width / 800;
    this._loadingScreen.addChild(this._splashImage);
    this._loadingScreen.addChild(this._madeWithText);
    this._loadingScreen.addChild(this._websiteText);
  }
};

gdjs.LoadingScreenRenderer = gdjs.LoadingScreenPixiRenderer; //Register the class to let the engine use it.

gdjs.LoadingScreenPixiRenderer.prototype.render = function(percent) {
  var screenBorder = 10;

  if (this._madeWithText) {
    this._madeWithText.position.x =
      this._pixiRenderer.width / 2 - this._madeWithText.width / 2;
    this._madeWithText.position.y =
      this._pixiRenderer.height / 2 -
      this._splashImage.height / 2 -
      this._madeWithText.height -
      20;
  }
  if (this._websiteText) {
    this._websiteText.position.x =
      this._pixiRenderer.width - this._websiteText.width - screenBorder;
    this._websiteText.position.y =
      this._pixiRenderer.height - this._websiteText.height - screenBorder;
  }

  this._progressText.text = percent + '%';
  this._progressText.position.x = screenBorder;
  this._progressText.position.y =
    this._pixiRenderer.height - this._progressText.height - screenBorder;

  this._pixiRenderer.render(this._loadingScreen);
};

gdjs.LoadingScreenPixiRenderer.prototype.unload = function() {
  // Nothing to do
};
