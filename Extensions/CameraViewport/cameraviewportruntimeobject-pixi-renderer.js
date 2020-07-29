/**
 * The PIXI.js renderer for the DummyRuntimeObject.
 *
 * @class DummyRuntimeObjectPixiRenderer
 * @constructor
 * @param {gdjs.CameraViewportObject} runtimeObject The object to render
 * @param {gdjs.RuntimeScene} runtimeScene The gdjs.RuntimeScene in which the object is
 */
gdjs.CameraViewportObjectPixiRenderer = function(runtimeObject, runtimeScene)
{
    this._object = runtimeObject; // Keep a reference to the object to read from it later.
    this._renderer = runtimeScene.getGame().getRenderer().getPIXIRenderer();
    this._renderTexture = new PIXI.RenderTexture.create({width: runtimeObject.getWidth(), height: runtimeObject.getHeight()});
    this._sprite = new PIXI.Sprite(this._renderTexture);
    this._scene = runtimeScene;
};

gdjs.CameraViewportObjectRenderer = gdjs.CameraViewportObjectPixiRenderer; //Register the class to let the engine use it.

gdjs.CameraViewportObjectPixiRenderer.prototype.getRendererObject = function() {
    return this._sprite;
};

gdjs.CameraViewportObjectPixiRenderer.prototype.update = function() {
    if(!this._sprite.visible) return;

    /* 
     * Remove all viewports: viewports can't render themselves as it could result in an endless loop.
     * We could theoretically count the renders and replace the camera with a blank texture after too many renders,
     * But chrome web gl automatically blocks textures that are made from a texture to be applied to the texture it is made from.
     */
     this._scene._constructListOfAllInstances();
    for(var objectId in this._scene._allInstancesList) {
        var object = this._scene._allInstancesList[objectId];
        if(object.type !== "CameraViewport::CameraViewport") continue;
        object.getRendererObject().visible = false;
    }

    // Camera magic
    this._renderer.render(this._scene.getRenderer().getPIXIContainer(), this._renderTexture);

    // Add the viewports back
    for(var objectId in this._scene._allInstancesList) {
        var object = this._scene._allInstancesList[objectId];
        if(object.type !== "CameraViewport::CameraViewport") continue;
        object.getRendererObject().visible = true;
    }
    this._sprite.x = this._object.getX();
    this._sprite.y = this._object.getY();
};

gdjs.CameraViewportObjectPixiRenderer.prototype.changeSize = function() {
    this._renderTexture.resize(this._object.getWidth(), this._object.getHeight());
};

gdjs.CameraViewportObjectPixiRenderer.prototype.changeVisible = function(hidden) {
    this._sprite.visible = hidden;
};
