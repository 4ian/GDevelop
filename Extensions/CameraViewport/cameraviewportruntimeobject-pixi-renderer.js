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
    /** @type {PIXI.RenderTexture} */
    this._renderTexture = new PIXI.RenderTexture.create({width: runtimeObject.getWidth(), height: runtimeObject.getHeight()});
    this._sprite = new PIXI.Sprite(this._renderTexture);
    this._scene = runtimeScene;
};

gdjs.CameraViewportObjectRenderer = gdjs.CameraViewportObjectPixiRenderer; //Register the class to let the engine use it.

gdjs.CameraViewportObjectPixiRenderer.tempTexture = PIXI.RenderTexture.create();

gdjs.CameraViewportObjectPixiRenderer.prototype.getRendererObject = function() {
    return this._sprite;
};

gdjs.CameraViewportObjectPixiRenderer.prototype.update = function() {
    if(!this._sprite.visible) return;

    // If not main camera, set layer the current camera's data
    if(this._object.camera > 0) {
        var allLayers = [];
        this._scene.getAllLayerNames(allLayers);
        for(var layerId in allLayers) {
            /** @type {gdjs.Layer} */
            var layer = this._scene.getLayer(allLayers[layerId]);
            layer.setCurrentCamera(this._object.camera);
        }
        // Recalculate culling for new camera parameters before rendering
        this._scene._updateObjectsVisibility();
    }

    this._scene._constructListOfAllInstances();
    var invisibleObjects = [];
    if(!this._object.showOtherCameras) {
        for(var objectId in this._scene._allInstancesList) {
            var object = this._scene._allInstancesList[objectId];
            if(object.type !== "CameraViewport::CameraViewport" || object.getRendererObject().visible === false) continue;
            object.getRendererObject().visible = false;
            invisibleObjects.push(object);
        }
    }

    /**
     * We can't directly render to the render texture as 
     * the render texture is part of what is being rendered, 
     * and webgl is blocking that (it could make an infinite loop).
     * So we need to render to an intermediate outside of the main container
     * and then render it to the real render texture.
     * This is only needed if you want to render a container with rendered cameras.
     * 
     * @TODO
     * There is probably a better method for rerendering from a render texture
     * than just rendering a sprite using it as texture.
     * Possible hint: https://www.html5gamedevs.com/topic/45423-why-is-this-not-allowed/?do=findComment&comment=251116
     */
    if(this._object.showOtherCameras) {
        gdjs.CameraViewportObjectPixiRenderer.tempTexture.resize(this._renderTexture.width, this._renderTexture.height);
        this._renderer.render(this._scene.getRenderer().getPIXIContainer(), gdjs.CameraViewportObjectPixiRenderer.tempTexture);
        this._renderer.render(new PIXI.Sprite(gdjs.CameraViewportObjectPixiRenderer.tempTexture), this._renderTexture);
    } else {
        this._renderer.render(this._scene.getRenderer().getPIXIContainer(), this._renderTexture);
    }

    for(var objectId in invisibleObjects) {
        var object = invisibleObjects[objectId];
        if(object.type !== "CameraViewport::CameraViewport") continue;
        object.getRendererObject().visible = true;
    }

    // Restore layer camera positions
    if(this._object.camera > 0) {
        var allLayers = [];
        this._scene.getAllLayerNames(allLayers);
        for(var layerId in allLayers) {
            var layer = this._scene.getLayer(allLayers[layerId]);
            layer.setCurrentCamera(0);
        }
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
