/**
 * The PIXI.js renderer for the DummyRuntimeObject.
 *
 * @class DummyRuntimeObjectPixiRenderer
 * @constructor
 * @param {gdjs.DummyRuntimeObject} runtimeObject The object to render
 * @param {gdjs.RuntimeScene} runtimeScene The gdjs.RuntimeScene in which the object is
 */
gdjs.DummyRuntimeObjectPixiRenderer = function(runtimeObject, runtimeScene)
{
    this._object = runtimeObject; // Keep a reference to the object to read from it later.

    // Here we're going to create a dummy text as an example.
    if ( this._text === undefined ) {
        this._text = new PIXI.Text(runtimeObject.getText(), {align:"left"});
    }

    // You can also create a PIXI sprite or other PIXI object
    // this._imageManager = runtimeScene.getGame().getImageManager();
    // if ( this._sprite === undefined )
    //     this._sprite = new PIXI.Sprite(this._imageManager.getInvalidPIXITexture());

    this._text.anchor.x = 0.5;
    this._text.anchor.y = 0.5;
    runtimeScene.getLayer("").getRenderer().addRendererObject(this._text, runtimeObject.getZOrder());

    this.updatePosition();
};

gdjs.DummyRuntimeObjectRenderer = gdjs.DummyRuntimeObjectPixiRenderer; //Register the class to let the engine use it.

gdjs.DummyRuntimeObjectPixiRenderer.prototype.getRendererObject = function() {
    // Mandatory, return the internal PIXI object used for your object:
    return this._text;
};

gdjs.DummyRuntimeObjectPixiRenderer.prototype.ensureUpToDate = function() {
    this.updatePosition();
};

gdjs.DummyRuntimeObjectPixiRenderer.prototype.updateText = function() {
    this._text.text = this._object.getText();
};

gdjs.DummyRuntimeObjectPixiRenderer.prototype.updatePosition = function() {
    this._text.position.x = this._object.x+this._text.width/2;
    this._text.position.y = this._object.y+this._text.height/2;
};

gdjs.DummyRuntimeObjectPixiRenderer.prototype.updateAngle = function() {
    this._text.rotation = gdjs.toRad(this._object.angle);
};

gdjs.DummyRuntimeObjectPixiRenderer.prototype.updateOpacity = function() {
    this._text.alpha = this._object.opacity / 255;
};

gdjs.DummyRuntimeObjectPixiRenderer.prototype.getWidth = function() {
    return this._text.width;
};

gdjs.DummyRuntimeObjectPixiRenderer.prototype.getHeight = function() {
    return this._text.height;
};
