gdjs.RuntimeScenePixiRenderer = function(runtimeScene, runtimeGameRenderer) {
  this._pixiRenderer = runtimeGameRenderer
    ? runtimeGameRenderer.getPIXIRenderer()
    : null;
  this._runtimeScene = runtimeScene;
  this._pixiContainer = new PIXI.Container(); //The Container meant to contains all pixi objects of the scene.
};

gdjs.RuntimeSceneRenderer = gdjs.RuntimeScenePixiRenderer; //Register the class to let the engine use it.

gdjs.RuntimeScenePixiRenderer.prototype.onCanvasResized = function() {
  if (!this._pixiRenderer) return;

  var runtimeGame = this._runtimeScene.getGame();
  this._pixiContainer.scale.x =
    this._pixiRenderer.width / runtimeGame.getDefaultWidth();
  this._pixiContainer.scale.y =
    this._pixiRenderer.height / runtimeGame.getDefaultHeight();
};

gdjs.RuntimeScenePixiRenderer.prototype.render = function() {
  if (!this._pixiRenderer) return;

  // this._renderProfileText(); //Uncomment to display profiling times

  // render the PIXI container of the scene
  this._pixiRenderer.backgroundColor = this._runtimeScene.getBackgroundColor();
  this._pixiRenderer.render(this._pixiContainer);
};

gdjs.RuntimeScenePixiRenderer.prototype._renderProfileText = function() {
  if (!this._runtimeScene.getProfiler()) return;

  if (!this._profilerText) {
    this._profilerText = new PIXI.Text(" ", {
      align: "left",
      stroke: "#FFF",
      strokeThickness: 1
    });
    this._pixiContainer.addChild(this._profilerText);
  }

  var average = this._runtimeScene.getProfiler().getFramesAverageMeasures();
  var outputs = [];
  gdjs.Profiler.getProfilerSectionTexts("All", average, outputs);

  this._profilerText.text = outputs.join("\n");
};

gdjs.RuntimeScenePixiRenderer.prototype.renderDebugDraw = function(instances, layersCameraCoordinates) {
  if (!this._debugDraw) {
    this._debugDraw = new PIXI.Graphics();
    this._pixiContainer.addChild(this._debugDraw);
  }
  /** @type PIXI.Graphics */
  var debugDraw = this._debugDraw;

  debugDraw.clear();
  debugDraw.beginFill(0x6868e8);
  debugDraw.lineStyle(1, 0x6868e8, 1);
  debugDraw.fillAlpha = 0.1;
  debugDraw.alpha = 0.8;

  for(var i = 0;i < instances.length;i++) {
    var object = instances[i];
    var cameraCoords = layersCameraCoordinates[object.getLayer()];
    var rendererObject = object.getRendererObject();

    if (!cameraCoords || !rendererObject) continue;

    var aabb = object.getAABB();
    debugDraw.drawRect(aabb.min[0], aabb.min[1], aabb.max[0] - aabb.min[0], aabb.max[1] - aabb.min[1]);
  }
  debugDraw.endFill();
};

gdjs.RuntimeScenePixiRenderer.prototype.hideCursor = function() {
  this._pixiRenderer.view.style.cursor = "none";
};

gdjs.RuntimeScenePixiRenderer.prototype.showCursor = function() {
  this._pixiRenderer.view.style.cursor = "";
};

gdjs.RuntimeScenePixiRenderer.prototype.getPIXIContainer = function() {
  return this._pixiContainer;
};
