// @ts-check

/**
 * The renderer for a gdjs.RuntimeScene using Pixi.js.
 * @class RuntimeScenePixiRenderer
 * @memberof gdjs
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {gdjs.RuntimeGamePixiRenderer} runtimeGameRenderer
 */
gdjs.RuntimeScenePixiRenderer = function (runtimeScene, runtimeGameRenderer) {
  this._pixiRenderer = runtimeGameRenderer
    ? runtimeGameRenderer.getPIXIRenderer()
    : null;
  this._runtimeScene = runtimeScene;
  this._pixiContainer = new PIXI.Container(); // Contains the layers of the scene (and, optionally, debug PIXI objects).
  this._pixiContainer.sortableChildren = true;

  /** @type {?PIXI.Graphics} */
  this._debugDraw = null;

  /** @type {?PIXI.Text} */
  this._profilerText = null;
};

gdjs.RuntimeSceneRenderer = gdjs.RuntimeScenePixiRenderer; //Register the class to let the engine use it.

gdjs.RuntimeScenePixiRenderer.prototype.onGameResolutionResized = function () {
  if (!this._pixiRenderer) return;

  var runtimeGame = this._runtimeScene.getGame();
  this._pixiContainer.scale.x =
    this._pixiRenderer.width / runtimeGame.getGameResolutionWidth();
  this._pixiContainer.scale.y =
    this._pixiRenderer.height / runtimeGame.getGameResolutionHeight();
};

gdjs.RuntimeScenePixiRenderer.prototype.onSceneUnloaded = function () {
  // Nothing to do.
};

gdjs.RuntimeScenePixiRenderer.prototype.render = function () {
  if (!this._pixiRenderer) return;

  // this._renderProfileText(); //Uncomment to display profiling times

  // render the PIXI container of the scene
  this._pixiRenderer.backgroundColor = this._runtimeScene.getBackgroundColor();
  this._pixiRenderer.render(this._pixiContainer);
};

gdjs.RuntimeScenePixiRenderer.prototype._renderProfileText = function () {
  var profiler = this._runtimeScene.getProfiler();
  if (!profiler) return;

  if (!this._profilerText) {
    this._profilerText = new PIXI.Text(' ', {
      align: 'left',
      stroke: '#FFF',
      strokeThickness: 1,
    });
    // Add on top of all layers:
    this._pixiContainer.addChild(this._profilerText);
  }

  var average = profiler.getFramesAverageMeasures();
  var outputs = [];
  gdjs.Profiler.getProfilerSectionTexts('All', average, outputs);

  this._profilerText.text = outputs.join('\n');
};

/**
 * @param {gdjs.RuntimeObject[]} instances
 * @param {Object.<string, number[]>} layersCameraCoordinates
 */
gdjs.RuntimeScenePixiRenderer.prototype.renderDebugDraw = function (
  instances,
  layersCameraCoordinates
) {
  if (!this._debugDraw) {
    this._debugDraw = new PIXI.Graphics();
    // Add on top of all layers:
    this._pixiContainer.addChild(this._debugDraw);
  }
  /** @type PIXI.Graphics */
  var debugDraw = this._debugDraw;

  debugDraw.clear();
  debugDraw.beginFill(0x6868e8);
  debugDraw.lineStyle(1, 0x6868e8, 1);
  debugDraw.fill.alpha = 0.1;
  debugDraw.alpha = 0.8;

  for (var i = 0; i < instances.length; i++) {
    var object = instances[i];
    var cameraCoords = layersCameraCoordinates[object.getLayer()];
    var rendererObject = object.getRendererObject();

    if (!cameraCoords || !rendererObject) continue;

    var aabb = object.getAABB();
    debugDraw.drawRect(
      aabb.min[0],
      aabb.min[1],
      aabb.max[0] - aabb.min[0],
      aabb.max[1] - aabb.min[1]
    );
  }
  debugDraw.endFill();
};

gdjs.RuntimeScenePixiRenderer.prototype.hideCursor = function () {
  if (!this._pixiRenderer) return;
  this._pixiRenderer.view.style.cursor = 'none';
};

gdjs.RuntimeScenePixiRenderer.prototype.showCursor = function () {
  if (!this._pixiRenderer) return;
  this._pixiRenderer.view.style.cursor = '';
};

gdjs.RuntimeScenePixiRenderer.prototype.getPIXIContainer = function () {
  return this._pixiContainer;
};

gdjs.RuntimeScenePixiRenderer.prototype.getPIXIRenderer = function () {
  return this._pixiRenderer;
};

/**
 * @param {gdjs.Layer} layer
 * @param {number} index
 */
gdjs.RuntimeScenePixiRenderer.prototype.setLayerIndex = function (
  layer,
  index
) {
  /** @type {gdjs.LayerPixiRenderer} */
  // @ts-ignore - assume the renderer is the correct one
  var layerPixiRenderer = layer.getRenderer();

  /** @type {PIXI.Container | ?PIXI.Sprite} */
  var layerPixiObject = layerPixiRenderer.getRendererObject();

  if (layer.isLightingLayer())
    layerPixiObject = layerPixiRenderer.getLightingSprite();

  if (!layerPixiObject) return;
  if (this._pixiContainer.children.indexOf(layerPixiObject) === index) return;

  this._pixiContainer.removeChild(layerPixiObject);
  this._pixiContainer.addChildAt(layerPixiObject, index);
};
