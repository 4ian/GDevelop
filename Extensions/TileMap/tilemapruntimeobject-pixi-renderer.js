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
  this._runtimeScene = runtimeScene;

  // Load (or reset)
  if (this._pixiObject === undefined) {
    this._pixiObject = new PIXI.tilemap.CompositeRectTileLayer(0);
    this._pixiObject.tileAnim = [0, 0];
  }

  runtimeScene
    .getLayer('')
    .getRenderer()
    .addRendererObject(this._pixiObject, runtimeObject.getZOrder());

  this.updateAngle();
  this.updateOpacity();
  this.updateTileMap();
  this.updatePosition();
};

gdjs.TileMapRuntimeObjectRenderer = gdjs.TileMapRuntimeObjectPixiRenderer;

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.getRendererObject = function() {
  return this._pixiObject;
};

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.incrementAnimationFrameX = function(runtimeScene){
  this._pixiObject.tileAnim[0] += 1;
};


gdjs.TileMapRuntimeObjectPixiRenderer.prototype._loadTileMapWithTileset = function(tilesetJsonData) {
  this._runtimeScene
    .getGame()
    .getJsonManager()
    .loadJson(this._object._tilemapJsonFile, (error, content)=> {
      if (error || !content) {
        console.error('An error happened while loading JSON resource:', error);
        return;
      };

      console.log(content, tilesetJsonData, {...content, tilesets:[tilesetJsonData] })
      PixiTileMapHelper.getPIXITileSet(
        textureName => this._runtimeScene
          .getGame()
          .getImageManager()
          .getPIXITexture(textureName),
          tilesetJsonData ? {...content, tilesets:[tilesetJsonData] } : content,
        this._object._tilemapAtlasImage,
        this._object._tilemapJsonFile,
        (tileset) => {
          if (tileset && this._pixiObject) {
            PixiTileMapHelper.updatePIXITileMap(
              this._pixiObject,
              tileset,
              this._object._displayMode,
              this._object._layerIndex,
              pako
            );
          }
        }
      )
    });
};

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.updateTileMap = function() {
  console.log(this._object._tilemapJsonFile);
  this._runtimeScene
  .getGame()
  .getJsonManager()
  .loadJson(this._object._tilemapJsonFile, (error, content)=> {
    if (error || !content) {
      console.error('An error happened while loading JSON resource:', error);
      return;
    };
    if (this._object._tilesetJsonFile) {
      this._runtimeScene
      .getGame()
      .getJsonManager()
      .loadJson(this._object._tilesetJsonFile, (error, tilesetData)=> {
        this._loadTileMapWithTileset(tilesetData)
      })
    } else {
      this._loadTileMapWithTileset()
    }
  })
};

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.updateTilesetJsonFile = function() {
  this._tilesetJsonFile = this._object._tilesetJsonFile;
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

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.setWidth = function(width) {
  this._pixiObject.width = width / this._pixiObject.scale.x;
  this._pixiObject.pivot.x = width / 2;
  this.updatePosition();
};

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.setHeight = function(height) {
  this._pixiObject.height = height / this._pixiObject.scale.y;
  this._pixiObject.pivot.y = height / 2;
  this.updatePosition();
};

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.getWidth = function() {
  return this._pixiObject.width;
};

gdjs.TileMapRuntimeObjectPixiRenderer.prototype.getHeight = function() {
  return this._pixiObject.height;
};
