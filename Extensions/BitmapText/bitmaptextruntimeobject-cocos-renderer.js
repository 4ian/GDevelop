/**
 * The Cocos2D-JS renderer for the BitmapTextRuntimeObject.
 *
 * The implementation is empty as the object is not supported in Cocos2D-JS for now.
 *
 * @class BitmapTextRuntimeObjectCocosRenderer
 * @constructor
 * @param {gdjs.BitmapTextRuntimeObject} runtimeObject The object to render
 * @param {gdjs.RuntimeScene} runtimeScene The gdjs.RuntimeScene in which the object is
 */
gdjs.BitmapTextRuntimeObjectCocosRenderer = function(runtimeObject, runtimeScene) {};

gdjs.BitmapTextRuntimeObjectRenderer = gdjs.BitmapTextRuntimeObjectCocosRenderer;

gdjs.BitmapTextRuntimeObjectCocosRenderer.prototype.getRendererObject = function() {};

gdjs.BitmapTextRuntimeObjectCocosRenderer.prototype.onDestroy = function() {};

gdjs.BitmapTextRuntimeObjectCocosRenderer.prototype._ensureFontAvailableAndGetFontName = function(oldFont) {};

gdjs.BitmapTextRuntimeObjectCocosRenderer.prototype.updateTint = function() {};

gdjs.BitmapTextRuntimeObjectCocosRenderer.prototype.updateFont = function() {};

gdjs.BitmapTextRuntimeObjectCocosRenderer.prototype.updateFontSize = function() {};

gdjs.BitmapTextRuntimeObjectCocosRenderer.prototype.updateScale = function() {};

gdjs.BitmapTextRuntimeObjectCocosRenderer.prototype.updateWrappingWidth = function() {};

gdjs.BitmapTextRuntimeObjectCocosRenderer.prototype.updateTextContent = function() {};

gdjs.BitmapTextRuntimeObjectCocosRenderer.prototype.updateAlignment = function() {};

gdjs.BitmapTextRuntimeObjectCocosRenderer.prototype.updatePosition = function() {};

gdjs.BitmapTextRuntimeObjectCocosRenderer.prototype.updateAngle = function() {};

gdjs.BitmapTextRuntimeObjectCocosRenderer.prototype.updateOpacity = function() {};

gdjs.BitmapTextRuntimeObjectCocosRenderer.prototype.getWidth = function() {
  return 0;
};

gdjs.BitmapTextRuntimeObjectCocosRenderer.prototype.getHeight = function() {
  return 0;
};
