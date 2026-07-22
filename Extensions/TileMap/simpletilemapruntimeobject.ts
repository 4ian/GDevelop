/// <reference path="helper/TileMapHelper.d.ts" />
namespace gdjs {
  /**
   * @category Objects > Tile Map
   */
  export type SimpleTileMapObjectDataType = {
    content: {
      atlasImage: string;
      rowCount: number;
      columnCount: number;
      tileSize: number;
      tilesWithHitBox: string;
    };
  };

  /**
   * @category Objects > Tile Map
   */
  export type SimpleTileMapObjectData = ObjectData &
    SimpleTileMapObjectDataType;

  /**
   * @category Objects > Tile Map
   */
  export type SimpleTileMapNetworkSyncDataType = {
    op: number;
    tm?: TileMapHelper.EditableTileMapAsJsObject;
  };

  /**
   * @category Objects > Tile Map
   */
  export type SimpleTileMapNetworkSyncData = ObjectNetworkSyncData &
    SimpleTileMapNetworkSyncDataType;

  const hitBoxTag: string = 'collision';

  /**
   * Displays a SimpleTileMap object.
   * @category Objects > Tile Map
   */
  export class SimpleTileMapRuntimeObject
    extends gdjs.AbstractTileMapRuntimeObject
    implements gdjs.Resizable, gdjs.Scalable, gdjs.OpacityHandler
  {
    _opacity: float = 255;
    _atlasImage: string;
    _tileMapManager: gdjs.TileMap.TileMapRuntimeManager;
    _tileMap: TileMapHelper.EditableTileMap | null = null;
    _renderer: gdjs.TileMapRuntimeObjectPixiRenderer;
    readonly _rowCount: number;
    readonly _columnCount: number;
    readonly _tileSize: number;
    _initialTileMapAsJsObject: TileMapHelper.EditableTileMapAsJsObject;
    readonly _initialTilesWithHitBox: number[];
    _isTileMapDirty: boolean = false;
    _collisionTileMap: gdjs.TileMap.TransformedCollisionTileMap | null = null;

    // TODO: Add a debug mode like for TileMapCollisionMaskRuntimeObject to draw?

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: ObjectData & SimpleTileMapObjectDataType,
      instanceData?: InstanceData
    ) {
      super(instanceContainer, objectData, instanceData);
      this._atlasImage = objectData.content.atlasImage;
      this._rowCount = objectData.content.rowCount;
      this._columnCount = objectData.content.columnCount;
      this._tileSize = objectData.content.tileSize;
      this._initialTileMapAsJsObject = {
        tileWidth: this._tileSize,
        tileHeight: this._tileSize,
        dimX: 1,
        dimY: 1,
        layers: [{ id: 0, alpha: this._opacity / 255, tiles: [] }],
      };
      this._initialTilesWithHitBox = (
        objectData.content.tilesWithHitBox as string
      )
        .split(',')
        .filter((id) => !!id)
        .map((idAsString) => parseInt(idAsString, 10));
      this._tileMapManager =
        gdjs.TileMap.TileMapRuntimeManager.getManager(instanceContainer);
      this._renderer = new gdjs.TileMapRuntimeObjectRenderer(
        this,
        instanceContainer
      );

      this._loadTileMap(
        this._initialTileMapAsJsObject,
        (tileMap: TileMapHelper.EditableTileMap) => {
          this._renderer.updatePosition();

          this._collisionTileMap = new gdjs.TileMap.TransformedCollisionTileMap(
            tileMap,
            hitBoxTag
          );

          this.updateTransformation();
        }
      );

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    updateTileMap(forceUpdate: boolean): void {
      this._tileMapManager.getOrLoadSimpleTileMapTextureCache(
        (textureName) => {
          return this.getInstanceContainer()
            .getGame()
            .getImageManager()
            .getPIXITexture(
              textureName
            ) as unknown as PIXI.BaseTexture<PIXI.Resource>;
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
          this._renderer.refreshPixiTileMap(textureCache, forceUpdate);
        },
        (error) => {
          console.error(
            `Could not load texture cache for atlas ${this._atlasImage} during prerender. The tilemap might be badly configured or an issues happened with the loaded atlas image:`,
            error
          );
        }
      );
    }

    updatePreRender(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      if (!this.isHidden()) {
        this.updateTileMap(this._isTileMapDirty);
        this._isTileMapDirty = false;
      }
    }

    updateFromObjectData(
      oldObjectData: SimpleTileMapObjectData,
      newObjectData: SimpleTileMapObjectData
    ): boolean {
      if (
        oldObjectData.content.atlasImage !== newObjectData.content.atlasImage
      ) {
        // TODO: support changing the atlas texture
        return false;
      }
      // Map content is updated at hot-reload by extraInitializationFromInitialInstance.
      return true;
    }

    getNetworkSyncData(
      syncOptions: GetNetworkSyncDataOptions
    ): SimpleTileMapNetworkSyncData {
      const syncData: SimpleTileMapNetworkSyncData = {
        ...super.getNetworkSyncData(syncOptions),
        op: this._opacity,
      };
      if (this._tileMap && syncOptions.syncFullTileMaps) {
        const currentTileMapAsJsObject = this._tileMap.toJSObject();
        syncData.tm = currentTileMapAsJsObject;
      }

      return syncData;
    }

    updateFromNetworkSyncData(
      networkSyncData: SimpleTileMapNetworkSyncData,
      options: UpdateFromNetworkSyncDataOptions
    ): void {
      super.updateFromNetworkSyncData(networkSyncData, options);

      if (networkSyncData.tm !== undefined) {
        this._loadTileMap(
          networkSyncData.tm,
          (tileMap: TileMapHelper.EditableTileMap) => {
            if (networkSyncData.w !== undefined) {
              this.setWidth(networkSyncData.w);
            }
            if (networkSyncData.h !== undefined) {
              this.setHeight(networkSyncData.h);
            }
            if (networkSyncData.op !== undefined) {
              this.setOpacity(networkSyncData.op);
            }

            // 4. Update position (calculations based on renderer's dimensions).
            this._renderer.updatePosition();

            if (this._collisionTileMap) {
              // If collision tile map is already defined, only update it.
              this._collisionTileMap.updateFromTileMap(tileMap);
            } else {
              this._collisionTileMap =
                new gdjs.TileMap.TransformedCollisionTileMap(
                  tileMap,
                  hitBoxTag
                );
            }

            this.updateTransformation();
          }
        );
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
      this._loadTileMap(
        this._initialTileMapAsJsObject,
        (tileMap: TileMapHelper.EditableTileMap) => {
          // 3. Set custom dimensions & opacity if applicable.
          if (initialInstanceData.customSize) {
            this.setWidth(initialInstanceData.width);
            this.setHeight(initialInstanceData.height);
          }
          this.setOpacity(
            initialInstanceData.opacity === undefined
              ? 255
              : initialInstanceData.opacity
          );

          // 4. Update position (calculations based on renderer's dimensions).
          this._renderer.updatePosition();

          if (this._collisionTileMap) {
            // If collision tile map is already defined, there's a good chance it means
            // extraInitializationFromInitialInstance is called when hot reloading the
            // scene so the collision is tile map is updated instead of being re-created.
            this._collisionTileMap.updateFromTileMap(tileMap);
          } else {
            this._collisionTileMap =
              new gdjs.TileMap.TransformedCollisionTileMap(tileMap, hitBoxTag);
          }

          this.invalidateTransformation();
          this.updateTransformation();
          this.invalidateHitboxes();
        }
      );
    }

    private _loadTileMap(
      tileMapAsJsObject: TileMapHelper.EditableTileMapAsJsObject,
      tileMapLoadingCallback: (tileMap: TileMapHelper.EditableTileMap) => void
    ): void {
      if (this._columnCount <= 0 || this._rowCount <= 0) {
        console.error(
          `Tilemap object ${this.name} is not configured properly.`
        );
        return;
      }

      this._tileMapManager.getOrLoadSimpleTileMap(
        tileMapAsJsObject,
        this.name,
        this._tileSize,
        this._columnCount,
        this._rowCount,
        (tileMap: TileMapHelper.EditableTileMap) => {
          this._initialTilesWithHitBox.forEach((tileId) => {
            const tileDefinition = tileMap.getTileDefinition(tileId);
            if (!tileDefinition) {
              console.warn(
                `Could not set hit box for tile with id ${tileId}. Continuing.`
              );
              return;
            }
            tileDefinition.addHitBox(
              hitBoxTag,
              [
                [0, 0],
                [0, tileMap.getTileHeight()],
                [tileMap.getTileWidth(), tileMap.getTileHeight()],
                [tileMap.getTileWidth(), 0],
              ],
              true
            );
          });

          this._tileMapManager.getOrLoadSimpleTileMapTextureCache(
            (textureName) => {
              return this.getInstanceContainer()
                .getGame()
                .getImageManager()
                .getPIXITexture(
                  textureName
                ) as unknown as PIXI.BaseTexture<PIXI.Resource>;
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
              this._tileMap = tileMap;
              this._renderer.refreshPixiTileMap(textureCache, true);
              tileMapLoadingCallback(tileMap);
            },
            (error) => {
              console.error(
                `Could not load texture cache for atlas ${this._atlasImage} during initial loading. The tilemap might be badly configured or an issues happened with the loaded atlas image:`,
                error
              );
            }
          );
        }
      );
    }

    onDestroyed(): void {
      super.onDestroyed();
      this._renderer.destroy();
    }

    setWidth(width: float): void {
      if (this.getWidth() === width) return;

      this.invalidateTransformation();
      this._renderer.setWidth(width);
      this.invalidateHitboxes();
    }

    setHeight(height: float): void {
      if (this.getHeight() === height) return;

      this.invalidateTransformation();
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
      this.invalidateTransformation();
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
      this.invalidateTransformation();
    }

    setX(x: float): void {
      super.setX(x);
      this._renderer.updatePosition();
      this.invalidateTransformation();
    }

    setY(y: float): void {
      super.setY(y);
      this._renderer.updatePosition();
      this.invalidateTransformation();
    }

    setAngle(angle: float): void {
      super.setAngle(angle);
      this._renderer.updateAngle();
      this.invalidateTransformation();
    }

    setOpacity(opacity: float): void {
      this._opacity = opacity;
      this._renderer.updateOpacity();
      this._isTileMapDirty = true;
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

    override getOriginalWidth(): float {
      const tileMap = this._tileMap;
      return tileMap ? tileMap.getWidth() : 20;
    }

    override getOriginalHeight(): float {
      const tileMap = this._tileMap;
      return tileMap ? tileMap.getHeight() : 20;
    }

    getScaleX(): float {
      return this._renderer.getScaleX();
    }

    getScaleY(): float {
      return this._renderer.getScaleY();
    }

    getTileSetColumnCount(): integer {
      return this._columnCount;
    }

    getTileSetRowCount(): integer {
      return this._rowCount;
    }

    getTileMap(): TileMapHelper.EditableTileMap | null {
      return this._tileMap;
    }

    getTileMapForEdition(): TileMapHelper.EditableTileMap | null {
      return this._tileMap;
    }

    getCollisionTileMap(): gdjs.TileMap.TransformedCollisionTileMap | null {
      return this._collisionTileMap;
    }

    getDisplayMode(): string {
      return 'all';
    }

    getDisplayedLayerIndex(): integer {
      return 0;
    }

    getEditedLayerIndex(): integer {
      return 0;
    }

    getCollisionMaskTag(): string {
      return hitBoxTag;
    }

    invalidateTileMap(): void {
      this._isTileMapDirty = true;
    }
  }
  gdjs.registerObject(
    'TileMap::SimpleTileMap',
    gdjs.SimpleTileMapRuntimeObject
  );
}
