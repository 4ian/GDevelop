/// <reference path="helper/TileMapHelper.d.ts" />
namespace gdjs {
  export type SimpleTileMapObjectDataType = {
    content: {
      opacity: number;
      atlasImage: string;
      rowCount: number;
      columnCount: number;
    };
  };

  export type SimpleTileMapObjectData = ObjectData &
    SimpleTileMapObjectDataType;

  export type SimpleTileMapNetworkSyncDataType = {
    op: number;
    ai: string;
    wid: number;
    hei: number;
  };

  export type SimpleTileMapNetworkSyncData = ObjectNetworkSyncData &
    SimpleTileMapNetworkSyncDataType;

  /**
   * Displays a SimpleTileMap object.
   */
  export class SimpleTileMapRuntimeObject
    extends gdjs.RuntimeObject
    implements gdjs.Resizable, gdjs.Scalable, gdjs.OpacityHandler {
    _opacity: float;
    _atlasImage: string;
    _tileMapManager: gdjs.TileMap.TileMapRuntimeManager;
    _renderer: gdjs.TileMapRuntimeObjectPixiRenderer;
    _rowCount: number;
    _columnCount: number;
    _tileSize: number;
    _displayMode = 'all';
    _layerIndex = 0;
    _initialTileMapAsJsObject: object | null = null;
    _isTileMapDirty: boolean = false;

    constructor(instanceContainer: gdjs.RuntimeInstanceContainer, objectData) {
      super(instanceContainer, objectData);
      this._opacity = objectData.content.opacity;
      this._atlasImage = objectData.content.atlasImage;
      this._rowCount = objectData.content.rowCount;
      this._columnCount = objectData.content.columnCount;
      this._tileSize = objectData.content.tileSize;
      this._tileMapManager = gdjs.TileMap.TileMapRuntimeManager.getManager(
        instanceContainer
      );
      this._renderer = new gdjs.TileMapRuntimeObjectRenderer(
        this,
        instanceContainer
      );

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    update(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      if (this._isTileMapDirty) {
        this._tileMapManager.getOrLoadSimpleTileMapTextureCache(
          (textureName) => {
            return (this.getInstanceContainer()
              .getGame()
              .getImageManager()
              .getPIXITexture(textureName) as unknown) as PIXI.BaseTexture<
              PIXI.Resource
            >;
          },
          this._atlasImage,
          this._tileSize,
          this._columnCount,
          this._rowCount,
          (textureCache: TileMapHelper.TileTextureCache | null) => {
            if (!textureCache) {
              // getOrLoadTextureCache already log warns and errors.
              return;
            }
            this._renderer.refreshPixiTileMap(textureCache);
          }
        );
        this._isTileMapDirty = false;
      }
    }

    updateFromObjectData(
      oldObjectData: SimpleTileMapObjectData,
      newObjectData: SimpleTileMapObjectData
    ): boolean {
      if (oldObjectData.content.opacity !== newObjectData.content.opacity) {
        this.setOpacity(newObjectData.content.opacity);
      }
      if (
        oldObjectData.content.atlasImage !== newObjectData.content.atlasImage
      ) {
        // TODO: support changing the atlas texture
        return false;
      }
      return true;
    }

    getNetworkSyncData(): SimpleTileMapNetworkSyncData {
      return {
        ...super.getNetworkSyncData(),
        op: this._opacity,
        ai: this._atlasImage,
        wid: this.getWidth(),
        hei: this.getHeight(),
      };
    }

    updateFromNetworkSyncData(
      networkSyncData: SimpleTileMapNetworkSyncData
    ): void {
      super.updateFromNetworkSyncData(networkSyncData);

      if (networkSyncData.op !== undefined) {
        this.setOpacity(networkSyncData.op);
      }
      if (networkSyncData.wid !== undefined) {
        this.setWidth(networkSyncData.wid);
      }
      if (networkSyncData.hei !== undefined) {
        this.setHeight(networkSyncData.hei);
      }
      if (networkSyncData.ai !== undefined) {
        // TODO: support changing the atlas texture
      }
    }

    extraInitializationFromInitialInstance(
      initialInstanceData: InstanceData
    ): void {
      // 1. load the tilemap from the instance.
      for (const property of initialInstanceData.stringProperties) {
        if (property.name === 'tilemap') {
          this._initialTileMapAsJsObject = JSON.parse(property.value);
        }
      }

      // 2. Update the renderer so that it updates the tilemap object
      // (used for width and position calculations).
      this._updateTileMap();

      // 3. Set custom dimensions if applicable.
      if (initialInstanceData.customSize) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
      }

      // 4. Update position (calculations based on renderer's dimensions).
      this._renderer.updatePosition();
    }

    private _updateTileMap(): void {
      const tileMap = TileMapHelper.EditableTileMap.from(
        this._initialTileMapAsJsObject,
        {
          tileSize: this._tileSize,
          columnCount: this._columnCount,
          rowCount: this._rowCount,
        }
      );
      this._tileMapManager.getOrLoadSimpleTileMapTextureCache(
        (textureName) => {
          return (this.getInstanceContainer()
            .getGame()
            .getImageManager()
            .getPIXITexture(textureName) as unknown) as PIXI.BaseTexture<
            PIXI.Resource
          >;
        },
        this._atlasImage,
        this._tileSize,
        this._columnCount,
        this._rowCount,
        (textureCache: TileMapHelper.TileTextureCache | null) => {
          if (!textureCache) {
            // getOrLoadTextureCache already log warns and errors.
            return;
          }
          this._renderer.updatePixiTileMap(tileMap, textureCache);
        }
      );
    }

    onDestroyed(): void {
      super.onDestroyed();
      this._renderer.destroy();
    }

    setWidth(width: float): void {
      if (this.getWidth() === width) return;

      this._renderer.setWidth(width);
      this.invalidateHitboxes();
    }

    setHeight(height: float): void {
      if (this.getHeight() === height) return;

      this._renderer.setHeight(height);
      this.invalidateHitboxes();
    }

    setSize(newWidth: float, newHeight: float): void {
      this.setWidth(newWidth);
      this.setHeight(newHeight);
    }

    /**
     * Get the scale of the object (or the geometric mean of the X and Y scale in case they are different).
     *
     * @return the scale of the object (or the geometric mean of the X and Y scale in case they are different).
     */
    getScale(): float {
      const scaleX = this.getScaleX();
      const scaleY = this.getScaleY();
      return scaleX === scaleY ? scaleX : Math.sqrt(scaleX * scaleY);
    }

    /**
     * Change the scale on X and Y axis of the object.
     *
     * @param scale The new scale (must be greater than 0).
     */
    setScale(scale: float): void {
      this.setScaleX(scale);
      this.setScaleY(scale);
    }

    /**
     * Change the scale on X axis of the object (changing its width).
     *
     * @param scaleX The new scale (must be greater than 0).
     */
    setScaleX(scaleX: float): void {
      if (scaleX < 0) {
        scaleX = 0;
      }
      if (this.getScaleX() === scaleX) return;

      this._renderer.setScaleX(scaleX);
      this.invalidateHitboxes();
    }

    /**
     * Change the scale on Y axis of the object (changing its width).
     *
     * @param scaleY The new scale (must be greater than 0).
     */
    setScaleY(scaleY: float): void {
      if (scaleY < 0) {
        scaleY = 0;
      }
      if (this.getScaleY() === scaleY) return;

      this._renderer.setScaleY(scaleY);
      this.invalidateHitboxes();
    }

    setX(x: float): void {
      super.setX(x);
      this._renderer.updatePosition();
    }

    setY(y: float): void {
      super.setY(y);
      this._renderer.updatePosition();
    }

    setAngle(angle: float): void {
      super.setAngle(angle);
      this._renderer.updateAngle();
    }

    setOpacity(opacity: float): void {
      this._opacity = opacity;
      this._renderer.updateOpacity();
    }

    getOpacity(): float {
      return this._opacity;
    }

    getWidth(): float {
      return this._renderer.getWidth();
    }

    getHeight(): float {
      return this._renderer.getHeight();
    }

    getScaleX(): float {
      return this._renderer.getScaleX();
    }

    getScaleY(): float {
      return this._renderer.getScaleY();
    }

    getTileAt(x: number, y: number): integer {
      const columnIndex = Math.floor(
        (x - this.getX()) / (this._tileSize * this.getScaleX())
      );
      const rowIndex = Math.floor(
        (y - this.getY()) / (this._tileSize * this.getScaleY())
      );
      return this._renderer.getTileId(columnIndex, rowIndex, 0);
    }

    setTileAt(tileId: number, x: number, y: number) {
      const columnIndex = Math.floor(
        (x - this.getX()) / (this._tileSize * this.getScaleX())
      );
      const rowIndex = Math.floor(
        (y - this.getY()) / (this._tileSize * this.getScaleY())
      );
      this._renderer.setTileId(columnIndex, rowIndex, 0, tileId);
      this._isTileMapDirty = true;
    }

    removeTileAt(x: number, y: number) {
      const columnIndex = Math.floor(
        (x - this.getX()) / (this._tileSize * this.getScaleX())
      );
      const rowIndex = Math.floor(
        (y - this.getY()) / (this._tileSize * this.getScaleY())
      );
      this._renderer.removeTile(columnIndex, rowIndex, 0);
      this._isTileMapDirty = true;
    }
  }
  gdjs.registerObject(
    'TileMap::SimpleTileMap',
    gdjs.SimpleTileMapRuntimeObject
  );
}
