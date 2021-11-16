namespace gdjs {
  const logger = new gdjs.Logger('Tilemap object');
  /**
   *
   * @extends gdjs.RuntimeObject
   */
  export class TileMapCollisionMaskRuntimeObject extends gdjs.RuntimeObject {
    _tilemapJsonFile: string;
    _tilesetJsonFile: string;
    _tilemapAtlasImage: string;
    _layerIndex: integer;
    _renderer: gdjs.TileMapCollisionMaskRender;
    _collisionTileMap: gdjs.TileMap.CollisionTileMap;
    _typeFilter: string;

    _fillColor: integer;
    _outlineColor: integer;
    _fillOpacity: float;
    _outlineOpacity: float;
    _outlineSize: float;

    constructor(runtimeScene, objectData) {
      super(runtimeScene, objectData);
      this._tilemapJsonFile = objectData.content.tilemapJsonFile;
      this._tilesetJsonFile = objectData.content.tilesetJsonFile;
      this._tilemapAtlasImage = objectData.content.tilemapAtlasImage;
      this._layerIndex = objectData.content.layerIndex;
      this._typeFilter = objectData.content.typeFilter;
      this._fillColor = this.rgbToNumber(gdjs.rgbOrHexToRGBColor(objectData.content.fillColor));
      this._outlineColor = this.rgbToNumber(gdjs.rgbOrHexToRGBColor(objectData.content.outlineColor));
      this._fillOpacity = objectData.content.fillOpacity;
      this._outlineOpacity = objectData.content.outlineOpacity;
      this._outlineSize = 1;//objectData.content.outlineSize;
      this._collisionTileMap = new gdjs.TileMap.CollisionTileMap(
        1,
        1,
        0,
        0,
        new Map()
      );
      this._renderer = new gdjs.TileMapCollisionMaskRender(this, runtimeScene);
      this._updateTileMap();

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

   rgbToNumber = function (components: [integer, integer, integer]
   ): integer {
     return (components[0] << 16) + (components[1] << 8) + components[2];
   };

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    getVisibilityAABB() {
      return null;
    }

    update(runtimeScene): void {}

    updateFromObjectData(oldObjectData: any, newObjectData: any): boolean {
      if (
        oldObjectData.content.tilemapJsonFile !==
        newObjectData.content.tilemapJsonFile
      ) {
        this.setTilemapJsonFile(newObjectData.content.tilemapJsonFile);
      }
      if (
        oldObjectData.content.tilesetJsonFile !==
        newObjectData.content.tilesetJsonFile
      ) {
        this.setTilesetJsonFile(newObjectData.content.tilesetJsonFile);
      }
      if (
        oldObjectData.content.layerIndex !== newObjectData.content.layerIndex
      ) {
        this.setLayerIndex(newObjectData.content.layerIndex);
      }
      if (
        oldObjectData.content.tilemapAtlasImage !==
        newObjectData.content.tilemapAtlasImage
      ) {
        // TODO: support changing the atlas texture
        return false;
      }
      return true;
    }

    /**
     * Initialize the extra parameters that could be set for an instance.
     */
    extraInitializationFromInitialInstance(initialInstanceData) {
      if (initialInstanceData.customSize) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
      }
    }

    private _updateTileMap(): void {
      this._runtimeScene
        .getGame()
        .getJsonManager()
        .loadJson(this._tilemapJsonFile, (error, tileMapJsonData) => {
          if (error) {
            logger.error(
              'An error happened while loading a Tilemap JSON data:',
              error
            );
            return;
          }
          const tiledMap = tileMapJsonData as gdjs.TileMap.TiledMap;
          if (this._tilesetJsonFile) {
            this._runtimeScene
              .getGame()
              .getJsonManager()
              .loadJson(this._tilesetJsonFile, (error, tilesetJsonData) => {
                if (error) {
                  logger.error(
                    'An error happened while loading Tileset JSON data:',
                    error
                  );
                  return;
                }
                const tileSet = tilesetJsonData as gdjs.TileMap.TiledTileset;
                tiledMap.tilesets = [tileSet];
                this._collisionTileMap = gdjs.TileMap.TiledCollisionTileMapLoader.load(
                  tiledMap
                  );
                this._renderer.redrawCollisionMask();
                this._defaultHitBoxes = Array.from(this._collisionTileMap.getAllHitboxes(
                  this._typeFilter
                ));
                this.hitBoxesDirty = true;
              });
          } else {
            this._collisionTileMap = gdjs.TileMap.TiledCollisionTileMapLoader.load(
              tiledMap
            );
            this._renderer.redrawCollisionMask();
            this._defaultHitBoxes = Array.from(this._collisionTileMap.getAllHitboxes(
              this._typeFilter
            ));
            this.hitBoxesDirty = true;
          }
        });
    }

    updateHitBoxes(): void {
      for (let i = 0; i < this._defaultHitBoxes.length; ++i) {
        if (i >= this.hitBoxes.length) {
          this.hitBoxes.push(new gdjs.Polygon());
        }
        for (
          let j = 0;
          j < this._defaultHitBoxes[i].vertices.length;
          ++j
        ) {
          if (j >= this.hitBoxes[i].vertices.length) {
            this.hitBoxes[i].vertices.push([0, 0]);
          }
          this._transformToGlobal(
            this._defaultHitBoxes[i].vertices[j][0],
            this._defaultHitBoxes[i].vertices[j][1],
            this.hitBoxes[i].vertices[j]
          );
        }
        this.hitBoxes[i].vertices.length = this._defaultHitBoxes[
          i
        ].vertices.length;
      }
      this.hitBoxes.length = this._defaultHitBoxes.length;
    }

    private _transformToGlobal(x: float, y: float, result: number[]) {
      let cx = this.getCenterX();
      let cy = this.getCenterY();

      // //Flipping
      // if (this._flippedX) {
      //   x = x + (cx - x) * 2;
      // }
      // if (this._flippedY) {
      //   y = y + (cy - y) * 2;
      // }

      //Scale
      const absScaleX = 1;//Math.abs(this._scaleX);
      const absScaleY = 1;//Math.abs(this._scaleY);
      x *= absScaleX;
      y *= absScaleY;
      cx *= absScaleX;
      cy *= absScaleY;

      //Rotation
      const oldX = x;
      const angleInRadians = (this.angle / 180) * Math.PI;
      const cosValue = Math.cos(
        // Only compute cos and sin once (10% faster than doing it twice)
        angleInRadians
      );
      const sinValue = Math.sin(angleInRadians);
      const xToCenterXDelta = x - cx;
      const yToCenterYDelta = y - cy;
      x = cx + cosValue * xToCenterXDelta - sinValue * yToCenterYDelta;
      y = cy + sinValue * xToCenterXDelta + cosValue * yToCenterYDelta;
      result.length = 2;
      result[0] = x + this.x;
      result[1] = y + this.y;
    }

    /**
     * Set the Tilemap json file to display.
     */
    setTilemapJsonFile(tilemapJsonFile): void {
      this._tilemapJsonFile = tilemapJsonFile;
      this._updateTileMap();
    }

    getTilemapJsonFile() {
      return this._tilemapJsonFile;
    }

    isTilemapJsonFile(selectedTilemapJsonFile): boolean {
      return this._tilemapJsonFile === selectedTilemapJsonFile;
    }

    setTilesetJsonFile(tilesetJsonFile) {
      this._tilesetJsonFile = tilesetJsonFile;
      this._updateTileMap();
    }
    getTilesetJsonFile() {
      return this._tilesetJsonFile;
    }
    isTilesetJsonFile(selectedTilesetJsonFile) {
      return this._tilesetJsonFile === selectedTilesetJsonFile;
    }

    setLayerIndex(layerIndex): void {
      this._layerIndex = layerIndex;
      this._updateTileMap();
    }

    getLayerIndex() {
      return this._layerIndex;
    }

    /**
     * Set the width of the object.
     * @param width The new width.
     */
    setWidth(width: float): void {
      if (this._renderer.getWidth() === width) return;

      this._renderer.setWidth(width);
      this.hitBoxesDirty = true;
    }

    /**
     * Set the height of the object.
     * @param height The new height.
     */
    setHeight(height: float): void {
      if (this._renderer.getHeight() === height) return;

      this._renderer.setHeight(height);
      this.hitBoxesDirty = true;
    }

    /**
     * Set object position on X axis.
     * @param x The new position X of the object.
     */
    setX(x: float): void {
      super.setX(x);
      this._renderer.updatePosition();
    }

    /**
     * Set object position on Y axis.
     * @param y The new position Y of the object.
     */
    setY(y: float): void {
      super.setY(y);
      this._renderer.updatePosition();
    }

    /**
     * Set the angle of the object.
     * @param angle The new angle of the object.
     */
    setAngle(angle: float): void {
      super.setAngle(angle);
      // TODO handle rotation
      //this._renderer.updateAngle();
    }

    /**
     * Get the width of the object.
     */
    getWidth(): float {
      return this._renderer.getWidth();
    }

    /**
     * Get the height of the object.
     */
    getHeight(): float {
      return this._renderer.getHeight();
    }
  }
  gdjs.registerObject(
    'TileMap::CollisionMask',
    gdjs.TileMapCollisionMaskRuntimeObject
  );
  TileMapCollisionMaskRuntimeObject.supportsReinitialization = false;
}
