gdjs.LoadingScreenPixiRenderer = function(runtimeGamePixiRenderer)
{
    this._pixiRenderer = runtimeGamePixiRenderer.getPIXIRenderer();
    this._loadingScreen = new PIXI.Container();
    this._text = new PIXI.Text(" ", {font: "bold 60px Arial", fill: "#FFFFFF", align: "center"});
    this._loadingScreen.addChild(this._text);
    this._text.position.y = this._pixiRenderer.height/2;
}

gdjs.LoadingScreenRenderer = gdjs.LoadingScreenPixiRenderer; //Register the class to let the engine use it.

gdjs.LoadingScreenPixiRenderer.prototype.render = function(percent) {
    this._text.text = percent + "%";
    this._text.position.x = this._pixiRenderer.width/2 - this._text.width/2;
    this._pixiRenderer.render(this._loadingScreen);
};
