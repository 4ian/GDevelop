/// <reference path="helper/TileMapHelper.d.ts" />
namespace gdjs {
  /**
   * @category Objects > Tile Map
   */
  export type TilemapObjectDataType = {
    content: {
      tilemapJsonFile: string;
      tilesetJsonFile: string;
      tilemapAtlasImage: string;
      displayMode: 'visible' | 'all' | 'index';
      layerIndex: integer;
      levelIndex: integer;
      animationSpeedScale: number;
      animationFps: number;
      collisionMaskTag: string;
      isCollisionMaskEnabled: boolean;
    };
  };

  /**
   * @category Objects > Tile Map
   */
  export type TilemapObjectData = ObjectData & TilemapObjectDataType;

  /**
   * @category Objects > Tile Map
   */
  export type TilemapNetworkSyncDataType = {
    op: number;
    tmjf: string;
    tsjf: string;
    tmai: string;
    dm: string;
    lai: number;
    lei: number;
    asps: number;
  };

  /**
   * @category Objects > Tile Map
   */
  export type TilemapNetworkSyncData = ObjectNetworkSyncData &
    TilemapNetworkSyncDataType;

  /**
   * Displays a Tilemap object (LDtk and Tiled).
   * @category Objects > Tile Map
   */
  export class TileMapRuntimeObject
    extends gdjs.AbstractTileMapRuntimeObject
    implements gdjs.Resizable, gdjs.Scalable, gdjs.OpacityHandler
  {
    _frameElapsedTime: float = 0;
    _opacity: float = 255;
    _tilemapJsonFile: string;
    _tilesetJsonFile: string;
    _tilemapAtlasImage: string;
    _displayMode: string;
    _layerIndex: integer;
    editedLayerIndex: integer;
    _levelIndex: integer;
    _animationSpeedScale: number;
    _animationFps: number;
    _tileMapManager: gdjs.TileMap.TileMapRuntimeManager;
    /** The unique tile map for a given resource. */
    _originalTileMap: TileMapHelper.EditableTileMap | null = null;
    /**
     * Either the same as `_originalTileMap` when no edition happened
     * or a cloned instance with some changes.
     */
    _tileMap: TileMapHelper.EditableTileMap | null = null;
    _renderer: gdjs.TileMapRuntimeObjectPixiRenderer;
    _isTileMapDirty: boolean = false;
    _collisionTileMap: gdjs.TileMap.TransformedCollisionTileMap | null = null;
    /**
     * The tiles are filtered according to this tag.
     *
     * This allows have multiple objects with different usage
     * for the same tile map.
     * For instance, platforms, jumpthru, ladder, spike, water...
     */
    private _collisionMaskTag: string;
    private isCollisionMaskEnabled = true;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: TilemapObjectData,
      instanceData?: InstanceData
    ) {
      super(instanceContainer, objectData, instanceData);
      this._tilemapJsonFile = objectData.content.tilemapJsonFile;
      this._tilesetJsonFile = objectData.content.tilesetJsonFile;
      this._tilemapAtlasImage = objectData.content.tilemapAtlasImage;
      this._displayMode = objectData.content.displayMode;
      this._layerIndex = objectData.content.layerIndex;
      this.editedLayerIndex = objectData.content.layerIndex;
      this._levelIndex = objectData.content.levelIndex;
      this._animationSpeedScale = objectData.content.animationSpeedScale;
      this._animationFps = objectData.content.animationFps;
      this._collisionMaskTag = objectData.content.collisionMaskTag;
      this.isCollisionMaskEnabled = objectData.content.isCollisionMaskEnabled;
      this._tileMapManager =
        gdjs.TileMap.TileMapRuntimeManager.getManager(instanceContainer);
      this._renderer = new gdjs.TileMapRuntimeObjectRenderer(
        this,
        instanceContainer
      );
      this.reloadTileMap();

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    updatePreRender(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      if (!this.isHidden()) {
        this.updateTileMap(this._isTileMapDirty);
        this._isTileMapDirty = false;
      }
    }

    update(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      if (this._animationSpeedScale <= 0 || this._animationFps === 0) {
        return;
      }
      const elapsedTime = this.getElapsedTime() / 1000;
      this._frameElapsedTime += elapsedTime * this._animationSpeedScale;
      while (this._frameElapsedTime > 1 / this._animationFps) {
        this._renderer.incrementAnimationFrameX(instanceContainer);
        this._frameElapsedTime -= 1 / this._animationFps;
      }
    }

    updateFromObjectData(
      oldObjectData: TilemapObjectData,
      newObjectData: TilemapObjectData
    ): boolean {
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
        oldObjectData.content.displayMode !== newObjectData.content.displayMode
      ) {
        this.setDisplayMode(newObjectData.content.displayMode);
      }
      if (
        oldObjectData.content.layerIndex !== newObjectData.content.layerIndex
      ) {
        this.setDisplayedLayerIndex(newObjectData.content.layerIndex);
      }
      if (
        oldObjectData.content.levelIndex !== newObjectData.content.levelIndex
      ) {
        this.setLevelIndex(newObjectData.content.levelIndex);
      }
      if (
        oldObjectData.content.animationSpeedScale !==
        newObjectData.content.animationSpeedScale
      ) {
        this.setAnimationSpeedScale(newObjectData.content.animationSpeedScale);
      }
      if (
        oldObjectData.content.animationFps !==
        newObjectData.content.animationFps
      ) {
        this.setAnimationFps(newObjectData.content.animationFps);
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

    getNetworkSyncData(
      syncOptions: GetNetworkSyncDataOptions
    ): TilemapNetworkSyncData {
      return {
        ...super.getNetworkSyncData(syncOptions),
        op: this._opacity,
        tmjf: this._tilemapJsonFile,
        tsjf: this._tilesetJsonFile,
        tmai: this._tilemapAtlasImage,
        dm: this._displayMode,
        lai: this._layerIndex,
        lei: this._levelIndex,
        asps: this._animationSpeedScale,
      };
    }

    updateFromNetworkSyncData(
      networkSyncData: TilemapNetworkSyncData,
      options: UpdateFromNetworkSyncDataOptions
    ): void {
      super.updateFromNetworkSyncData(networkSyncData, options);

      if (networkSyncData.op !== undefined) {
        this.setOpacity(networkSyncData.op);
      }
      if (networkSyncData.tmjf !== undefined) {
        this.setTilemapJsonFile(networkSyncData.tmjf);
      }
      if (networkSyncData.tsjf !== undefined) {
        this.setTilesetJsonFile(networkSyncData.tsjf);
      }
      if (networkSyncData.tmai !== undefined) {
        this._tilemapAtlasImage = networkSyncData.tmai;
      }
      if (networkSyncData.dm !== undefined) {
        this.setDisplayMode(networkSyncData.dm);
      }
      if (networkSyncData.lai !== undefined) {
        this.setDisplayedLayerIndex(networkSyncData.lai);
      }
      if (networkSyncData.lei !== undefined) {
        this.setLevelIndex(networkSyncData.lei);
      }
      if (networkSyncData.asps !== undefined) {
        this.setAnimationSpeedScale(networkSyncData.asps);
      }
    }

    extraInitializationFromInitialInstance(initialInstanceData): void {
      if (initialInstanceData.customSize) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
        this.invalidateTransformation();
      }
      this.setOpacity(
        initialInstanceData.opacity === undefined
          ? 255
          : initialInstanceData.opacity
      );
    }

    reloadTileMap(): void {
      this._tileMapManager.getOrLoadTileMap(
        this._tilemapJsonFile,
        this._tilesetJsonFile,
        this._levelIndex,
        (tileMap: TileMapHelper.EditableTileMap | null) => {
          if (!tileMap) {
            // getOrLoadTileMap already warn.
            return;
          }
          this._tileMapManager.getOrLoadTextureCache(
            (textureName) => {
              const game = this.getInstanceContainer().getGame();
              const mappedName = game.resolveEmbeddedResource(
                this._tilemapJsonFile,
                textureName
              );
              return game
                .getImageManager()
                .getPIXITexture(
                  mappedName
                ) as unknown as PIXI.BaseTexture<PIXI.Resource>;
            },
            this._tilemapAtlasImage,
            this._tilemapJsonFile,
            this._tilesetJsonFile,
            this._levelIndex,
            (textureCache: TileMapHelper.TileTextureCache | null) => {
              if (!textureCache) {
                // getOrLoadTextureCache already log warns and errors.
                return;
              }
              this._originalTileMap = tileMap;
              this._tileMap = tileMap;
              if (this.isCollisionMaskEnabled) {
                this._collisionTileMap =
                  new gdjs.TileMap.TransformedCollisionTileMap(
                    tileMap,
                    this._collisionMaskTag,
                    this._layerIndex
                  );
              }
              this._renderer.refreshPixiTileMap(textureCache, true);
              this.invalidateHitboxes();
            }
          );
        }
      );
    }

    updateTileMap(forceUpdate: boolean): void {
      this._tileMapManager.getOrLoadTextureCache(
        (textureName) => {
          const game = this.getInstanceContainer().getGame();
          const mappedName = game.resolveEmbeddedResource(
            this._tilemapJsonFile,
            textureName
          );
          return game
            .getImageManager()
            .getPIXITexture(
              mappedName
            ) as unknown as PIXI.BaseTexture<PIXI.Resource>;
        },
        this._tilemapAtlasImage,
        this._tilemapJsonFile,
        this._tilesetJsonFile,
        this._levelIndex,
        (textureCache: TileMapHelper.TileTextureCache | null) => {
          if (!textureCache) {
            // getOrLoadTextureCache already log warns and errors.
            return;
          }
          this._renderer.refreshPixiTileMap(textureCache, true);
          this.invalidateHitboxes();
        }
      );
    }

    onDestroyed(): void {
      super.onDestroyed();
      this._renderer.destroy();
    }

    /**
     * Set the Tilemap file to display.
     */
    setTilemapJsonFile(tilemapJsonFile: string): void {
      this._tilemapJsonFile = tilemapJsonFile;
      this.reloadTileMap();
    }

    getTilemapJsonFile(): string {
      return this._tilemapJsonFile;
    }

    isTilemapJsonFile(selectedTilemapJsonFile: string): boolean {
      return this._tilemapJsonFile === selectedTilemapJsonFile;
    }

    setTilesetJsonFile(tilesetJsonFile: string): void {
      this._tilesetJsonFile = tilesetJsonFile;
      this.reloadTileMap();
    }

    getTilesetJsonFile(): string {
      return this._tilesetJsonFile;
    }

    setAnimationFps(animationFps: float) {
      this._animationFps = animationFps;
    }

    getAnimationFps(): float {
      return this._animationFps;
    }

    isTilesetJsonFile(selectedTilesetJsonFile: string): boolean {
      return this._tilesetJsonFile === selectedTilesetJsonFile;
    }

    isDisplayMode(selectedDisplayMode: string): boolean {
      return this._displayMode === selectedDisplayMode;
    }

    setDisplayMode(displayMode: string): void {
      this._displayMode = displayMode;
      this.reloadTileMap();
    }

    getDisplayMode(): string {
      return this._displayMode;
    }

    setDisplayedLayerIndex(layerIndex: integer): void {
      this._layerIndex = layerIndex;
      this.reloadTileMap();
    }

    getDisplayedLayerIndex(): integer {
      return this._layerIndex;
    }

    /**
     * Change which layer is used to edit and read tiles.
     * @param layerIndex The index of the layer to edit
     */
    setEditedLayerIndex(layerIndex: integer): void {
      this.editedLayerIndex = layerIndex;
    }

    getEditedLayerIndex(): integer {
      return this.editedLayerIndex;
    }

    setLevelIndex(levelIndex: integer): void {
      this._levelIndex = levelIndex;
      this.reloadTileMap();
    }

    getLevelIndex() {
      return this._levelIndex;
    }

    setAnimationSpeedScale(animationSpeedScale: float): void {
      this._animationSpeedScale = animationSpeedScale;
    }

    getAnimationSpeedScale(): float {
      return this._animationSpeedScale;
    }

    setWidth(width: float): void {
      if (this.getWidth() === width) return;

      this._renderer.setWidth(width);
      this.invalidateHitboxes();
      this.invalidateTransformation();
    }

    setHeight(height: float): void {
      if (this.getHeight() === height) return;

      this._renderer.setHeight(height);
      this.invalidateHitboxes();
      this.invalidateTransformation();
    }

    setSize(newWidth: float, newHeight: float): void {
      this.setWidth(newWidth);
      this.setHeight(newHeight);
    }

    override getOriginalWidth(): float {
      const tileMap = this._tileMap;
      return tileMap ? tileMap.getWidth() : 20;
    }

    override getOriginalHeight(): float {
      const tileMap = this._tileMap;
      return tileMap ? tileMap.getHeight() : 20;
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

    getTileMap(): TileMapHelper.EditableTileMap | null {
      return this._tileMap;
    }

    /**
     * Return a tile map that is safe to modify.
     */
    getTileMapForEdition(): TileMapHelper.EditableTileMap | null {
      if (!this._tileMap || !this._originalTileMap) {
        return null;
      }
      if (this._tileMap === this._originalTileMap) {
        this._tileMap = this._originalTileMap.clone();
        this._collisionTileMap = new gdjs.TileMap.TransformedCollisionTileMap(
          this._tileMap,
          this._collisionMaskTag,
          this._layerIndex
        );
      this.invalidateTransformation();
      }
      return this._tileMap;
    }

    getCollisionTileMap(): gdjs.TileMap.TransformedCollisionTileMap | null {
      return this._collisionTileMap;
    }

    getCollisionMaskTag(): string {
      return this._collisionMaskTag;
    }

    invalidateTileMap(): void {
      this._isTileMapDirty = true;
    }
  }
  gdjs.registerObject('TileMap::TileMap', gdjs.TileMapRuntimeObject);
}
