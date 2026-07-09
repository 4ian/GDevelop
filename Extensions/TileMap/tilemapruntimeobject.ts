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
    extends gdjs.RuntimeObject
    implements gdjs.TileMap, gdjs.Resizable, gdjs.Scalable, gdjs.OpacityHandler
  {
    /**
     * A reusable Point to avoid allocations.
     */
    private static readonly workingPoint: FloatPoint = [0, 0];

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
    _sceneToTileMapTransformation: gdjs.AffineTransformation =
      new gdjs.AffineTransformation();
    _tileMapToSceneTransformation: gdjs.AffineTransformation =
      new gdjs.AffineTransformation();
    private _transformationIsUpToDate: boolean = false;

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

    setLayerIndex(layerIndex: integer): void {
      this._layerIndex = layerIndex;
      this.reloadTileMap();
    }

    getLayerIndex(): integer {
      return this._layerIndex;
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

    getGridRowCount(): integer {
      return this._tileMap ? this._tileMap.getDimensionY() : 0;
    }

    getGridColumnCount(): integer {
      return this._tileMap ? this._tileMap.getDimensionX() : 0;
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
      }
      return this._tileMap;
    }

    updateTransformation() {
      if (this._transformationIsUpToDate) {
        return;
      }

      this._tileMapToSceneTransformation.setToIdentity();
      this._tileMapToSceneTransformation.translate(this.getX(), this.getY());
      this._tileMapToSceneTransformation.rotateAround(
        (this.getAngle() * Math.PI) / 180,
        this.getCenterX(),
        this.getCenterY()
      );
      this._tileMapToSceneTransformation.scale(
        Math.abs(this._renderer.getScaleX()),
        Math.abs(this._renderer.getScaleY())
      );

      if (this._collisionTileMap) {
        const collisionTileMapTransformation =
          this._collisionTileMap.getTransformation();
        collisionTileMapTransformation.copyFrom(
          this._tileMapToSceneTransformation
        );
        this._collisionTileMap.setTransformation(
          collisionTileMapTransformation
        );
      }
      this._sceneToTileMapTransformation.copyFrom(
        this._tileMapToSceneTransformation
      );
      this._sceneToTileMapTransformation.invert();
      this._transformationIsUpToDate = true;
    }

    getSceneXCoordinateOfTileCenter(
      columnIndex: integer,
      rowIndex: integer
    ): float {
      if (!this._tileMap) {
        return 0;
      }
      const sceneCoordinates: FloatPoint = TileMapRuntimeObject.workingPoint;
      this._tileMapToSceneTransformation.transform(
        [
          (columnIndex + 0.5) * this._tileMap.getTileWidth(),
          (rowIndex + 0.5) * this._tileMap.getTileHeight(),
        ],
        sceneCoordinates
      );
      return sceneCoordinates[0];
    }

    getSceneYCoordinateOfTileCenter(
      columnIndex: integer,
      rowIndex: integer
    ): float {
      if (!this._tileMap) {
        return 0;
      }
      const sceneCoordinates: FloatPoint = TileMapRuntimeObject.workingPoint;
      this._tileMapToSceneTransformation.transform(
        [
          (columnIndex + 0.5) * this._tileMap.getTileWidth(),
          (rowIndex + 0.5) * this._tileMap.getTileHeight(),
        ],
        sceneCoordinates
      );
      return sceneCoordinates[1];
    }

    /**
     * The returned array is alway the same.
     */
    getGridCoordinatesFromSceneCoordinates(
      x: float,
      y: float
    ): [integer, integer] {
      this.updateTransformation();
      const result = TileMapRuntimeObject.workingPoint;
      if (!this._tileMap) {
        result[0] = 0;
        result[1] = 0;
        return result;
      }
      this._sceneToTileMapTransformation.transform([x, y], result);

      result[0] = Math.floor(result[0] / this._tileMap.getTileWidth());
      result[1] = Math.floor(result[1] / this._tileMap.getTileHeight());
      return result;
    }

    getColumnIndexAtPosition(x: float, y: float): integer {
      return this.getGridCoordinatesFromSceneCoordinates(x, y)[0];
    }

    getRowIndexAtPosition(x: float, y: float): integer {
      return this.getGridCoordinatesFromSceneCoordinates(x, y)[1];
    }

    getTileAtPosition(x: float, y: float): integer {
      const [columnIndex, rowIndex] =
        this.getGridCoordinatesFromSceneCoordinates(x, y);
      return this.getTileAtGridCoordinates(columnIndex, rowIndex);
    }

    getTileAtGridCoordinates(columnIndex: integer, rowIndex: integer): integer {
      return this.getTileId(columnIndex, rowIndex, 0);
    }

    setTileAtPosition(tileId: number, x: float, y: float) {
      const [columnIndex, rowIndex] =
        this.getGridCoordinatesFromSceneCoordinates(x, y);
      this.setTileAtGridCoordinates(tileId, columnIndex, rowIndex);
    }

    setTileAtGridCoordinates(
      tileId: number,
      columnIndex: integer,
      rowIndex: integer
    ) {
      const tileMap = this.getTileMapForEdition();
      if (!tileMap) {
        return;
      }
      const layer = tileMap.getTileLayer(this._layerIndex);
      if (!layer) {
        return;
      }
      const oldTileId = layer.getTileId(columnIndex, rowIndex);
      if (tileId === oldTileId) {
        return;
      }
      layer.setTile(columnIndex, rowIndex, tileId);

      if (this._collisionTileMap) {
        const oldTileDefinition =
          oldTileId !== undefined && tileMap.getTileDefinition(oldTileId);
        const newTileDefinition = tileMap.getTileDefinition(tileId);
        const hadFullHitBox =
          !!oldTileDefinition &&
          oldTileDefinition.hasFullHitBox(this._collisionMaskTag);
        const haveFullHitBox =
          !!newTileDefinition &&
          newTileDefinition.hasFullHitBox(this._collisionMaskTag);
        if (hadFullHitBox !== haveFullHitBox) {
          this._collisionTileMap.invalidateTile(
            this._layerIndex,
            columnIndex,
            rowIndex
          );
        }
      }
      this._isTileMapDirty = true;
    }

    flipTileOnYAtPosition(x: float, y: float, flip: boolean) {
      const [columnIndex, rowIndex] =
        this.getGridCoordinatesFromSceneCoordinates(x, y);
      this.flipTileOnYAtGridCoordinates(columnIndex, rowIndex, flip);
    }

    flipTileOnXAtPosition(x: float, y: float, flip: boolean) {
      const [columnIndex, rowIndex] =
        this.getGridCoordinatesFromSceneCoordinates(x, y);
      this.flipTileOnXAtGridCoordinates(columnIndex, rowIndex, flip);
    }

    flipTileOnYAtGridCoordinates(
      columnIndex: integer,
      rowIndex: integer,
      flip: boolean
    ) {
      this.flipTileOnY(columnIndex, rowIndex, 0, flip);
      this._isTileMapDirty = true;
      // No need to invalidate hit boxes since at the moment, collision mask
      // cannot be configured on each tile.
    }

    flipTileOnXAtGridCoordinates(
      columnIndex: integer,
      rowIndex: integer,
      flip: boolean
    ) {
      this.flipTileOnX(columnIndex, rowIndex, 0, flip);
      this._isTileMapDirty = true;
      // No need to invalidate hit boxes since at the moment, collision mask
      // cannot be configured on each tile.
    }

    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param layerIndex The layer index.
     * @param flip true if the tile should be flipped.
     */
    flipTileOnY(x: integer, y: integer, layerIndex: integer, flip: boolean) {
      const tileMap = this.getTileMapForEdition();
      if (!tileMap) return;
      tileMap.flipTileOnY(x, y, layerIndex, flip);
    }

    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param layerIndex The layer index.
     * @param flip true if the tile should be flipped.
     */
    flipTileOnX(x: integer, y: integer, layerIndex: integer, flip: boolean) {
      const tileMap = this.getTileMapForEdition();
      if (!tileMap) return;
      tileMap.flipTileOnX(x, y, layerIndex, flip);
    }

    isTileFlippedOnXAtPosition(x: float, y: float) {
      const [columnIndex, rowIndex] =
        this.getGridCoordinatesFromSceneCoordinates(x, y);

      return this.isTileFlippedOnX(columnIndex, rowIndex, 0);
    }

    isTileFlippedOnXAtGridCoordinates(columnIndex: integer, rowIndex: integer) {
      return this.isTileFlippedOnX(columnIndex, rowIndex, 0);
    }

    isTileFlippedOnYAtPosition(x: float, y: float) {
      const [columnIndex, rowIndex] =
        this.getGridCoordinatesFromSceneCoordinates(x, y);

      return this.isTileFlippedOnY(columnIndex, rowIndex, 0);
    }

    isTileFlippedOnYAtGridCoordinates(columnIndex: integer, rowIndex: integer) {
      return this.isTileFlippedOnY(columnIndex, rowIndex, 0);
    }

    removeTileAtPosition(x: float, y: float) {
      const [columnIndex, rowIndex] =
        this.getGridCoordinatesFromSceneCoordinates(x, y);
      this.removeTileAtGridCoordinates(columnIndex, rowIndex);
    }

    removeTileAtGridCoordinates(columnIndex: integer, rowIndex: integer) {
      const tileMap = this.getTileMapForEdition();
      if (!tileMap) {
        return;
      }
      const layer = tileMap.getTileLayer(this._layerIndex);
      if (!layer) {
        return;
      }
      const oldTileId = layer.getTileId(columnIndex, rowIndex);
      if (oldTileId === undefined) {
        return;
      }
      layer.removeTile(columnIndex, rowIndex);
      if (this._collisionTileMap) {
        const oldTileDefinition =
          oldTileId !== undefined && tileMap.getTileDefinition(oldTileId);
        const hadFullHitBox =
          !!oldTileDefinition &&
          oldTileDefinition.hasFullHitBox(this._collisionMaskTag);
        if (hadFullHitBox) {
          this._collisionTileMap.invalidateTile(
            this._layerIndex,
            columnIndex,
            rowIndex
          );
        }
      }
      this._isTileMapDirty = true;
    }

    setGridRowCount(targetRowCount: integer) {
      const tileMap = this.getTileMapForEdition();
      if (targetRowCount <= 0) return;
      if (!tileMap) return;
      tileMap.setDimensionY(targetRowCount);
      if (this._collisionTileMap) {
        this._collisionTileMap.updateDimensions();
      }
      this._isTileMapDirty = true;
      this.invalidateHitboxes();
    }

    setGridColumnCount(targetColumnCount: integer) {
      const tileMap = this.getTileMapForEdition();
      if (targetColumnCount <= 0) return;
      if (!tileMap) return;
      tileMap.setDimensionX(targetColumnCount);
      if (this._collisionTileMap) {
        this._collisionTileMap.updateDimensions();
      }
      this._isTileMapDirty = true;
      this.invalidateHitboxes();
    }

    /**
     * This method is expensive and should not be called.
     * Prefer using {@link getHitBoxesAround} rather than getHitBoxes.
     */
    override getHitBoxes(): gdjs.Polygon[] {
      return super.getHitBoxes();
    }

    override updateHitBoxes(): void {
      this.updateTransformation();
      if (!this._collisionTileMap) return;
      this.hitBoxes = Array.from(
        this._collisionTileMap.getAllHitboxes(this._collisionMaskTag)
      );
      this.hitBoxesDirty = false;
      this.updateAABB();
    }

    // This implementation doesn't use updateHitBoxes.
    // It's important for good performances.
    override getAABB(): AABB {
      // It's fine to compute it every time because tile maps are rarely rotated.
      // It avoids calling updateHitBoxes to rely on hitBoxesDirty to know when
      // to update.
      this.updateAABB();
      return this.aabb;
    }

    // This implementation doesn't use updateHitBoxes.
    // It's important for good performances.
    override updateAABB(): void {
      if (this.getAngle() === 0) {
        // Fast computation of AABB for non rotated object
        this.aabb.min[0] = this.x;
        this.aabb.min[1] = this.y;
        this.aabb.max[0] = this.aabb.min[0] + this.getWidth();
        this.aabb.max[1] = this.aabb.min[1] + this.getHeight();
      } else {
        if (!this._collisionTileMap) return;
        const affineTransformation = this._collisionTileMap.getTransformation();

        const left = 0;
        const right = this._collisionTileMap.getWidth();
        const top = 0;
        const bottom = this._collisionTileMap.getHeight();

        const workingPoint = this.aabb.min;

        workingPoint[0] = left;
        workingPoint[1] = top;
        affineTransformation.transform(workingPoint, workingPoint);
        const topLeftX = workingPoint[0];
        const topLeftY = workingPoint[1];

        workingPoint[0] = right;
        workingPoint[1] = top;
        affineTransformation.transform(workingPoint, workingPoint);
        const topRightX = workingPoint[0];
        const topRightY = workingPoint[1];

        workingPoint[0] = right;
        workingPoint[1] = bottom;
        affineTransformation.transform(workingPoint, workingPoint);
        const bottomRightX = workingPoint[0];
        const bottomRightY = workingPoint[1];

        workingPoint[0] = left;
        workingPoint[1] = bottom;
        affineTransformation.transform(workingPoint, workingPoint);
        const bottomLeftX = workingPoint[0];
        const bottomLeftY = workingPoint[1];

        this.aabb.min[0] = Math.min(
          topLeftX,
          topRightX,
          bottomRightX,
          bottomLeftX
        );
        this.aabb.max[0] = Math.max(
          topLeftX,
          topRightX,
          bottomRightX,
          bottomLeftX
        );
        this.aabb.min[1] = Math.min(
          topLeftY,
          topRightY,
          bottomRightY,
          bottomLeftY
        );
        this.aabb.max[1] = Math.max(
          topLeftY,
          topRightY,
          bottomRightY,
          bottomLeftY
        );
      }
    }

    getHitBoxesAround(
      left: float,
      top: float,
      right: float,
      bottom: float
    ): Iterable<gdjs.Polygon> {
      // This implementation doesn't call updateHitBoxes.
      // It's important for good performances because there is no need to
      // update the whole collision mask where only a few hitboxes must be
      // checked.
      this.updateTransformation();
      if (!this._collisionTileMap) return [];
      return this._collisionTileMap.getHitboxesAround(
        this._collisionMaskTag,
        left,
        top,
        right,
        bottom
      );
    }

    override isSpatiallyIndexed(): boolean {
      return true;
    }
  }
  gdjs.registerObject('TileMap::TileMap', gdjs.TileMapRuntimeObject);
}
