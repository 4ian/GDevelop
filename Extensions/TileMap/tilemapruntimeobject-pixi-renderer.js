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
    this._pixiObject = new PIXI.tilemap.CompositeRectTileLayer(0);
    this._pixiObject.tileAnim = [0, 0];
  } else {
    // Run updates a single time once loaded here
  }

  runtimeScene
    .getLayer('')
    .getRenderer()
    .addRendererObject(this._pixiObject, runtimeObject.getZOrder());
  
  this.updateAngle();
  this.updateOpacity();
  this.updateTileMap(runtimeScene);
  this.updatePosition();
};

gdjs.TileMapRuntimeObjectRenderer = gdjs.TileMapRuntimeObjectPixiRenderer;

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.getRendererObject = function() {
  return this._pixiObject;
};

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.incrementAnimationFrameX = function(runtimeScene){
  this._pixiObject.tileAnim[0] += 1;
};

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.updateTileMap = function(runtimeScene) {

  var atlasTexture = runtimeScene
    .getGame()
    .getImageManager()
    .getPIXITexture(this._object._tilemapAtlasImage);
  
  runtimeScene
    .getGame()
    .getJsonManager()
    .loadJson(this._object._tiledFile, (error, content)=> {
      if (error) {
        console.error('An error happened while loading JSON resource:', error);
      } else {
        if (!content) return;
        console.log("JSON", content, atlasTexture)

        console.log(
          this._pixiObject,
          PixiTileMapHelper,
          this,
          this._object._tiledFile,
          this._object._tilemapAtlasImage,
          this._object._displayMode
          )
  
          
        // ReloadTilemap
        PixiTileMapHelper.getPIXITileSet(
          atlasTexture,
          content,
          this._object._tilemapAtlasImage,
          this._object._tiledFile,
          (tileset) => {
            
            if (tileset && this._pixiObject) {
              PixiTileMapHelper.updatePIXITileMap(
                this._pixiObject,
                tileset,
                this._object._displayMode,
                this._object._layerIndex
              );
              console.log('LOADED', tileset, this._pixiObject);
            }
          }
        )
        // runtimeScene._renderer._pixiRenderer
        // this._runtimeScene.getTimeManager().getTimeFromStart()
      }
    });   
};

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.updateAnimationFrame = function() {
  console.log("UPDATING....")
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
gdjs.TileMapRuntimeObjectPixiRenderer.prototype.updateDisplayMode = function() {
  this._pixiObject._displayMode = this._object._displayMode;
  //this._pixiObject.dirty = true;
  this.updatePosition();
};
gdjs.TileMapRuntimeObjectPixiRenderer.prototype.updateLayerIndex = function() {
  this._pixiObject._layerIndex = this._object._layerIndex;
  //this._pixiObject.dirty = true;
  this.updatePosition();
};
gdjs.TileMapRuntimeObjectPixiRenderer.prototype.updateAnimationSpeed = function() {
  this._pixiObject._animationSpeed = this._object._animationSpeed;
  //this._pixiObject.dirty = true;
  this.updatePosition();
};

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.updatePosition = function() {
  const originalWidth = this._pixiObject.width / this._pixiObject.scale.x;
  const originalHeight = this._pixiObject.height / this._pixiObject.scale.y;
  this._pixiObject.pivot.x = originalWidth / 2;
  this._pixiObject.pivot.y = originalHeight / 2;

  this._pixiObject.position.x = this._object.x + this._pixiObject.width / 2;
  this._pixiObject.position.y = this._object.y + this._pixiObject.height / 2;
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
