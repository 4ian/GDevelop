/**
 * The PIXI.js renderer for the Tile map runtime object.
 *
 * @class TileMapRuntimeObjectPixiRenderer
 * @constructor
 * @param {gdjs.TileMapRuntimeObject} runtimeObject The object to render
 * @param {gdjs.RuntimeScene} runtimeScene The gdjs.RuntimeScene in which the object is
 */
gdjs.TileMapRuntimeObjectPixiRenderer = function(runtimeObject, runtimeScene) {
  this._object = runtimeObject;

  // Load (or reset)
  if (this._pixiObject === undefined) {
    // this._pixiObject = new PIXI.tilemap.CompositeRectTileLayer(
    //   0,
    //   runtimeObject._tilemapAtlasImage.texture
    // );
    this._pixiObject = new PIXI.Container();

    this._object.hidden = !runtimeObject._visible;
  } else {
    // Run updates a single time once loaded here
  }

  runtimeScene
    .getLayer('')
    .getRenderer()
    .addRendererObject(this._pixiObject, runtimeObject.getZOrder());

  // Set the anchor in the center, so that the object rotates around
  // its center
  this._pixiObject.anchor.x = 0.5;
  this._pixiObject.anchor.y = 0.5;

  this.updatePosition();
  this.updateAngle();
  this.updateOpacity();
  this.updateTileMap();
  this.updateVisible();
};

gdjs.TileMapRuntimeObjectRenderer = gdjs.TileMapRuntimeObjectPixiRenderer;

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.getRendererObject = function() {
  return this._pixiObject;
};

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.updateTileMap = function() {
//   gdjs.PixiImageManager.getPIXITileSet(
//     this._tilemapAtlasImage,
//     this._tiledFile,
//     function(tileset) {
//       console.log("LOADED", tileset);
//       if (tileset && this._pixiObject) {
//         gdjs.PixiImageManager.updatePIXITileMap(
//           tileset,
//           this._pixiObject,
//           this._render,
//           this._layerIndex
//         );
//       }
//     }
  //update the external object here
};

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.updateTiledFile = function() {
  this._pixiObject._tiledFile = this._object._tiledFile;
  //this._pixiObject.dirty = true;
  this.updatePosition();
};
gdjs.TileMapRuntimeObjectPixiRenderer.prototype.updateTilemapAtlasImage = function() {
  this._pixiObject._tilemapAtlasImage = this._object._tilemapAtlasImage;
  //this._pixiObject.dirty = true;
  this.updatePosition();
};
gdjs.TileMapRuntimeObjectPixiRenderer.prototype.updateRender = function() {
  this._pixiObject._render = this._object._render;
  //this._pixiObject.dirty = true;
  this.updatePosition();
};
gdjs.TileMapRuntimeObjectPixiRenderer.prototype.updateLayerIndex = function() {
  this._pixiObject._layerIndex = this._object._layerIndex;
  //this._pixiObject.dirty = true;
  this.updatePosition();
};
gdjs.TileMapRuntimeObjectPixiRenderer.prototype.updateVisible = function() {
  this._pixiObject._visible = this._object._visible;
  //this._pixiObject.dirty = true;
  this.updatePosition();
};

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.updatePosition = function() {
  this._pixiObject.position.x = this._object.x + this._pixiObject.width / 2;
  this._pixiObject.position.y = this._object.y + this._pixiObject.height / 2;
};

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.updateVisible = function() {
  this._pixiObject.hidden = !this._object._visible;
};

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.updateAngle = function() {
  this._pixiObject.rotation = gdjs.toRad(this._object.angle);
};

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.updateOpacity = function() {
  this._pixiObject.alpha = this._object._opacity / 255;
};

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.getWidth = function() {
  return this._pixiObject.width;
};

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.getHeight = function() {
  return this._pixiObject.height;
};
