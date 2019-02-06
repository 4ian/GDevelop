/**
 * The PIXI.js renderer for the VideoRuntimeObject.
 * 
 * @class VideoRuntimeObjectPixiRenderer
 * @constructor
 * @param {gdjs.VideoRuntimeObject} runtimeObject The object to render
 * @param {gdjs.RuntimeScene} runtimeScene The gdjs.RuntimeScene in which the object is
 */
gdjs.VideoRuntimeObjectPixiRenderer = function(runtimeObject, runtimeScene)
{
    this._object = runtimeObject; // Keep a reference to the object to read from it later.
    
    


    // Here we're going to create a video text as an example.
    if ( this._pixiObject === undefined ) {     
        this._textureVideo = new PIXI.Texture.fromVideo('C:/Users/RTX-Bouh/Desktop/test_video_GD.mp4');

      //Setup the PIXI object:
      this._pixiObject = new PIXI.Sprite(this._textureVideo);
    }
    
      //this._pixiObject.anchor.x = 0.5;
      //this._pixiObject.anchor.y = 0.5;
    runtimeScene.getLayer("").getRenderer().addRendererObject(this._pixiObject, runtimeObject.getZOrder());

    //this.updatePosition();
};

gdjs.VideoRuntimeObjectRenderer = gdjs.VideoRuntimeObjectPixiRenderer; //Register the class to let the engine use it.

gdjs.VideoRuntimeObjectPixiRenderer.prototype.getRendererObject = function() {
    // Mandatory, return the internal PIXI object used for your object:
    return this._pixiObject;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.ensureUpToDate = function() {
    this.updatePosition();
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updatePosition = function() {
    this._pixiObject.position.x = this._object.x
    this._pixiObject.position.y = this._object.y;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updateAngle = function() {
    this._pixiObject.rotation = gdjs.toRad(this._object.angle);
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updateOpacity = function() {
    this._pixiObject.alpha = this._object.opacity / 255;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.getWidth = function() {
    return this._pixiObject.width;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.getHeight = function() {
    return this._pixiObject.height;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updateWidth = function() {
    this._pixiObject.width = this._object.width;
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updateWidth = function() {
    this._pixiObject.width = this._object._width;
    //this._updateSpritesAndTexturesSize();
   // this._updateLocalPositions();
    this.updatePosition();
};

gdjs.VideoRuntimeObjectPixiRenderer.prototype.updateHeight = function() {
    this._pixiObject.height = this._object._height;
    //this._updateSpritesAndTexturesSize();
    //this._updateLocalPositions();
    this.updatePosition();
};

/*
TODO
setloop
*/
gdjs.VideoRuntimeObjectPixiRenderer.prototype.setLoop = function(looped) {
    this._pixiObject.texture.baseTexture.source.loop = looped;
};

/*

gdjs.VideoRuntimeObjectPixiRenderer.prototype.play = function() {
    //this._pixiObject.texture.baseTexture.source.loop = isLooped;
    console.log("#2bouh-renderer");
    this._pixiObject.texture.baseTexture.source.play();
};

 */