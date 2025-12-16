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
      displayMode: string;
      layerIndex: integer;
      levelIndex: integer;
      animationSpeedScale: number;
      animationFps: number;
    };
  };

  /**
   * @category Objects > Tile Map
   */
  export type TilemapObjectData = ObjectData & TilemapObjectDataType;

  /**
   * @category Synchronization > Tile Map
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
   * @category Synchronization > Tile Map
   */
  export type TilemapNetworkSyncData = ObjectNetworkSyncData &
    TilemapNetworkSyncDataType;

  /**
   * Displays a Tilemap object (LDtk and Tiled).
   * @category Objects > Tile Map
   */
  export class TileMapRuntimeObject
    extends gdjs.RuntimeObject
    implements gdjs.Resizable, gdjs.Scalable, gdjs.OpacityHandler
  {
    _frameElapsedTime: float = 0;
    _opacity: float = 255;
    _tilemapJsonFile: string;
    _tilesetJsonFile: string;
    _tilemapAtlasImage: string;
    _displayMode: string;
    _layerIndex: integer;
    _levelIndex: integer;
    _animationSpeedScale: number;
    _animationFps: number;
    _tileMapManager: gdjs.TileMap.TileMapRuntimeManager;
    _tileMap: TileMapHelper.EditableTileMap | null = null;
    _renderer: gdjs.TileMapRuntimeObjectPixiRenderer;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: TilemapObjectData
    ) {
      super(instanceContainer, objectData);
      this._tilemapJsonFile = objectData.content.tilemapJsonFile;
      this._tilesetJsonFile = objectData.content.tilesetJsonFile;
      this._tilemapAtlasImage = objectData.content.tilemapAtlasImage;
      this._displayMode = objectData.content.displayMode;
      this._layerIndex = objectData.content.layerIndex;
      this._levelIndex = objectData.content.levelIndex;
      this._animationSpeedScale = objectData.content.animationSpeedScale;
      this._animationFps = objectData.content.animationFps;
      this._tileMapManager =
        gdjs.TileMap.TileMapRuntimeManager.getManager(instanceContainer);
      this._renderer = new gdjs.TileMapRuntimeObjectRenderer(
        this,
        instanceContainer
      );
      this.updateTileMap();

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
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
        this.setLayerIndex(newObjectData.content.layerIndex);
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
        this.setLayerIndex(networkSyncData.lai);
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
      }
      this.setOpacity(
        initialInstanceData.opacity === undefined
          ? 255
          : initialInstanceData.opacity
      );
    }

    updateTileMap(): void {
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
              this._tileMap = tileMap;
              this._renderer.refreshPixiTileMap(textureCache);
              this.invalidateHitboxes();
            }
          );
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
      this.updateTileMap();
    }

    getTilemapJsonFile(): string {
      return this._tilemapJsonFile;
    }

    isTilemapJsonFile(selectedTilemapJsonFile: string): boolean {
      return this._tilemapJsonFile === selectedTilemapJsonFile;
    }

    setTilesetJsonFile(tilesetJsonFile: string): void {
      this._tilesetJsonFile = tilesetJsonFile;
      this.updateTileMap();
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
      this.updateTileMap();
    }

    getDisplayMode(): string {
      return this._displayMode;
    }

    setLayerIndex(layerIndex): void {
      this._layerIndex = layerIndex;
      this.updateTileMap();
    }

    getLayerIndex(): integer {
      return this._layerIndex;
    }

    setLevelIndex(levelIndex): void {
      this._levelIndex = levelIndex;
      this.updateTileMap();
    }

    getLevelIndex() {
      return this._levelIndex;
    }

    setAnimationSpeedScale(animationSpeedScale): void {
      this._animationSpeedScale = animationSpeedScale;
    }

    getAnimationSpeedScale(): float {
      return this._animationSpeedScale;
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

    override getOriginalWidth(): float {
      return this.getTileMapWidth();
    }

    override getOriginalHeight(): float {
      return this.getTileMapHeight();
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

    getTileMap(): TileMapHelper.EditableTileMap | null {
      return this._tileMap;
    }

    getTileMapWidth() {
      const tileMap = this._tileMap;
      return tileMap ? tileMap.getWidth() : 20;
    }

    getTileMapHeight() {
      const tileMap = this._tileMap;
      return tileMap ? tileMap.getHeight() : 20;
    }

    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param layerIndex The layer index.
     * @returns The tile's id.
     */
    getTileId(x: integer, y: integer, layerIndex: integer): integer {
      if (!this._tileMap) return -1;
      return this._tileMap.getTileId(x, y, layerIndex);
    }

    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param layerIndex The layer index.
     * @param flip true if the tile should be flipped.
     */
    flipTileOnY(x: integer, y: integer, layerIndex: integer, flip: boolean) {
      if (!this._tileMap) return;
      this._tileMap.flipTileOnY(x, y, layerIndex, flip);
    }

    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param layerIndex The layer index.
     * @param flip true if the tile should be flipped.
     */
    flipTileOnX(x: integer, y: integer, layerIndex: integer, flip: boolean) {
      if (!this._tileMap) return;
      this._tileMap.flipTileOnX(x, y, layerIndex, flip);
    }

    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param layerIndex The layer index.
     */
    isTileFlippedOnX(x: integer, y: integer, layerIndex: integer): boolean {
      if (!this._tileMap) return false;
      return this._tileMap.isTileFlippedOnX(x, y, layerIndex);
    }

    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param layerIndex The layer index.
     */
    isTileFlippedOnY(x: integer, y: integer, layerIndex: integer): boolean {
      if (!this._tileMap) return false;
      return this._tileMap.isTileFlippedOnY(x, y, layerIndex);
    }
  }
  gdjs.registerObject('TileMap::TileMap', gdjs.TileMapRuntimeObject);
}
