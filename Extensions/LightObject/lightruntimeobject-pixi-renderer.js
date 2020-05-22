gdjs.LightRuntimeObjectPixiRenderer = function(runtimeObject, runtimeScene)
{
    this._object = runtimeObject;
    this._light = null;
};

gdjs.LightRuntimeObjectRenderer = gdjs.LightRuntimeObjectPixiRenderer; //Register the class to let the engine use it.

gdjs.LightRuntimeObjectPixiRenderer.prototype.getRendererObject = function() {
    // Mandatory, return the internal PIXI object used for your object:
    return this._light;
};