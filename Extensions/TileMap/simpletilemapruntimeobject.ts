/// <reference path="helper/TileMapHelper.d.ts" />
namespace gdjs {
  export type SimpleTileMapObjectDataType = {
    content: {
      opacity: number;
      atlasImage: string;
      rowCount: number;
      columnCount: number;
      tileSize: number;
      tilesWithHitBox: string;
    };
  };

  export type SimpleTileMapObjectData = ObjectData &
    SimpleTileMapObjectDataType;

  export type SimpleTileMapNetworkSyncDataType = {
    op: number;
    ai: string;
    wid: number;
    hei: number;
    // TODO: Support tilemap synchronization. Find an efficient way to send tiles changes.
  };

  export type SimpleTileMapNetworkSyncData = ObjectNetworkSyncData &
    SimpleTileMapNetworkSyncDataType;

  /**
   * Displays a SimpleTileMap object.
   */
  export class SimpleTileMapRuntimeObject
    extends gdjs.RuntimeObject
    implements gdjs.Resizable, gdjs.Scalable, gdjs.OpacityHandler {
    /**
     * A reusable Point to avoid allocations.
     */
    private static readonly workingPoint: FloatPoint = [0, 0];

    _opacity: float = 255;
    _atlasImage: string;
    _tileMapManager: gdjs.TileMap.TileMapRuntimeManager;
    _renderer: gdjs.TileMapRuntimeObjectPixiRenderer;
    readonly _rowCount: number;
    readonly _columnCount: number;
    readonly _tileSize: number;
    _displayMode = 'all';
    _layerIndex = 0;
    _initialTileMapAsJsObject: TileMapHelper.EditableTileMapAsJsObject;
    readonly _initialTilesWithHitBox: number[];
    _isTileMapDirty: boolean = false;
    _sceneToTileMapTransformation: gdjs.AffineTransformation = new gdjs.AffineTransformation();
    _tileMapToSceneTransformation: gdjs.AffineTransformation = new gdjs.AffineTransformation();
    _collisionTileMap: gdjs.TileMap.TransformedCollisionTileMap | null = null;
    _hitBoxTag: string = 'collision';
    private _transformationIsUpToDate: boolean = false;

    // TODO: Add a debug mode like for TileMapCollisionMaskRuntimeObject to draw?

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: SimpleTileMapObjectDataType
    ) {
      super(instanceContainer, objectData);
      this._opacity = objectData.content.opacity;
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
      this._initialTilesWithHitBox = (objectData.content
        .tilesWithHitBox as string)
        .split(',')
        .filter((id) => !!id)
        .map((idAsString) => parseInt(idAsString, 10));
      this._tileMapManager = gdjs.TileMap.TileMapRuntimeManager.getManager(
        instanceContainer
      );
      this._renderer = new gdjs.TileMapRuntimeObjectRenderer(
        this,
        instanceContainer
      );

      this._loadInitialTileMap((tileMap: TileMapHelper.EditableTileMap) => {
        this._renderer.updatePosition();

        this._collisionTileMap = new gdjs.TileMap.TransformedCollisionTileMap(
          tileMap,
          this._hitBoxTag
        );

        this.updateTransformation();
      });

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    updatePreRender(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      if (this._isTileMapDirty) {
        let shouldContinue = true;
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
          },
          (error) => {
            shouldContinue = false;
            console.error(
              `Could not load texture cache for atlas ${this._atlasImage} during prerender. The tilemap might be badly configured or an issues happened with the loaded atlas image:`,
              error
            );
          }
        );
        if (!shouldContinue) return;
        if (this._collisionTileMap) {
          const tileMap = this._renderer.getTileMap();
          if (tileMap) this._collisionTileMap.updateFromTileMap(tileMap);
        }
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
      // Map content is updated at hot-reload by extraInitializationFromInitialInstance.
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

      if (
        networkSyncData.op !== undefined &&
        networkSyncData.op !== this._opacity
      ) {
        this.setOpacity(networkSyncData.op);
      }
      if (
        networkSyncData.wid !== undefined &&
        networkSyncData.wid !== this.getWidth()
      ) {
        this.setWidth(networkSyncData.wid);
      }
      if (
        networkSyncData.hei !== undefined &&
        networkSyncData.hei !== this.getHeight()
      ) {
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
      this._loadInitialTileMap((tileMap: TileMapHelper.EditableTileMap) => {
        // 3. Set custom dimensions & opacity if applicable.
        if (initialInstanceData.customSize) {
          this.setWidth(initialInstanceData.width);
          this.setHeight(initialInstanceData.height);
        }
        if (initialInstanceData.opacity !== undefined) {
          this.setOpacity(initialInstanceData.opacity);
        }

        // 4. Update position (calculations based on renderer's dimensions).
        this._renderer.updatePosition();

        if (this._collisionTileMap) {
          // If collision tile map is already defined, there's a good chance it means
          // extraInitializationFromInitialInstance is called when hot reloading the
          // scene so the collision is tile map is updated instead of being re-created.
          this._collisionTileMap.updateFromTileMap(tileMap);
        } else {
          this._collisionTileMap = new gdjs.TileMap.TransformedCollisionTileMap(
            tileMap,
            this._hitBoxTag
          );
        }

        this.updateTransformation();
      });
    }

    private _loadInitialTileMap(
      tileMapLoadingCallback: (tileMap: TileMapHelper.EditableTileMap) => void
    ): void {
      if (!this._initialTileMapAsJsObject) return;
      if (this._columnCount <= 0 || this._rowCount <= 0) {
        console.error(
          `Tilemap object ${this.name} is not configured properly.`
        );
        return;
      }

      this._tileMapManager.getOrLoadSimpleTileMap(
        this._initialTileMapAsJsObject,
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
              this._hitBoxTag,
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

      this._transformationIsUpToDate = false;
      this._renderer.setWidth(width);
      this.invalidateHitboxes();
    }

    setHeight(height: float): void {
      if (this.getHeight() === height) return;

      this._transformationIsUpToDate = false;
      this._renderer.setHeight(height);
      this.invalidateHitboxes();
    }

    setSize(newWidth: float, newHeight: float): void {
      this.setWidth(newWidth);
      this.setHeight(newHeight);
      this._transformationIsUpToDate = false;
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
      this._transformationIsUpToDate = false;
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
      this._transformationIsUpToDate = false;
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
      this._transformationIsUpToDate = false;
    }

    setX(x: float): void {
      super.setX(x);
      this._renderer.updatePosition();
      this._transformationIsUpToDate = false;
    }

    setY(y: float): void {
      super.setY(y);
      this._renderer.updatePosition();
      this._transformationIsUpToDate = false;
    }

    setAngle(angle: float): void {
      super.setAngle(angle);
      this._renderer.updateAngle();
      this._transformationIsUpToDate = false;
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

    getScaleX(): float {
      return this._renderer.getScaleX();
    }

    getScaleY(): float {
      return this._renderer.getScaleY();
    }

    /**
     * This method is expensive and should not be called.
     * Prefer using {@link getHitBoxesAround} rather than getHitBoxes.
     */
    getHitBoxes(): gdjs.Polygon[] {
      if (this.hitBoxesDirty) {
        this.updateHitBoxes();
        this.updateAABB();
        this.hitBoxesDirty = false;
      }
      return this.hitBoxes;
    }

    updateHitBoxes(): void {
      this.updateTransformation();
      if (!this._collisionTileMap) return;
      this.hitBoxes = Array.from(
        this._collisionTileMap.getAllHitboxes(this._hitBoxTag)
      );
      this.hitBoxesDirty = false;
      this.updateAABB();
    }

    // This implementation doesn't use updateHitBoxes.
    // It's important for good performances.
    updateAABB(): void {
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
        this._hitBoxTag,
        left,
        top,
        right,
        bottom
      );
    }

    updateTransformation() {
      if (this._transformationIsUpToDate) {
        return;
      }
      const absScaleX = Math.abs(this._renderer.getScaleX());
      const absScaleY = Math.abs(this._renderer.getScaleY());

      this._tileMapToSceneTransformation.setToIdentity();

      // Translation
      this._tileMapToSceneTransformation.translate(this.getX(), this.getY());

      // Rotation
      const angleInRadians = (this.getAngle() * Math.PI) / 180;
      this._tileMapToSceneTransformation.rotateAround(
        angleInRadians,
        this.getCenterX(),
        this.getCenterY()
      );

      // Scale
      this._tileMapToSceneTransformation.scale(absScaleX, absScaleY);
      if (this._collisionTileMap) {
        const collisionTileMapTransformation = this._collisionTileMap.getTransformation();
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
      const sceneCoordinates: FloatPoint =
        SimpleTileMapRuntimeObject.workingPoint;
      this._tileMapToSceneTransformation.transform(
        [
          (columnIndex + 0.5) * this._tileSize,
          (rowIndex + 0.5) * this._tileSize,
        ],
        sceneCoordinates
      );
      return sceneCoordinates[0];
    }

    getSceneYCoordinateOfTileCenter(
      columnIndex: integer,
      rowIndex: integer
    ): float {
      const sceneCoordinates: FloatPoint =
        SimpleTileMapRuntimeObject.workingPoint;
      this._tileMapToSceneTransformation.transform(
        [
          (columnIndex + 0.5) * this._tileSize,
          (rowIndex + 0.5) * this._tileSize,
        ],
        sceneCoordinates
      );
      return sceneCoordinates[1];
    }

    getGridCoordinatesFromSceneCoordinates(
      x: float,
      y: float
    ): [integer, integer] {
      this.updateTransformation();

      const gridCoordinates: FloatPoint =
        SimpleTileMapRuntimeObject.workingPoint;
      this._sceneToTileMapTransformation.transform([x, y], gridCoordinates);

      const columnIndex = Math.floor(gridCoordinates[0] / this._tileSize);
      const rowIndex = Math.floor(gridCoordinates[1] / this._tileSize);

      return [columnIndex, rowIndex];
    }

    getColumnIndexAtPosition(x: float, y: float): integer {
      return this.getGridCoordinatesFromSceneCoordinates(x, y)[0];
    }

    getRowIndexAtPosition(x: float, y: float): integer {
      return this.getGridCoordinatesFromSceneCoordinates(x, y)[1];
    }

    getTileAtPosition(x: float, y: float): integer {
      const [
        columnIndex,
        rowIndex,
      ] = this.getGridCoordinatesFromSceneCoordinates(x, y);
      return this.getTileAtGridCoordinates(columnIndex, rowIndex);
    }

    getTileAtGridCoordinates(columnIndex: integer, rowIndex: integer): integer {
      return this._renderer.getTileId(columnIndex, rowIndex, 0);
    }

    setTileAtPosition(tileId: number, x: float, y: float) {
      const [
        columnIndex,
        rowIndex,
      ] = this.getGridCoordinatesFromSceneCoordinates(x, y);
      this.setTileAtGridCoordinates(tileId, columnIndex, rowIndex);
    }

    setTileAtGridCoordinates(
      tileId: number,
      columnIndex: integer,
      rowIndex: integer
    ) {
      const tileMap = this._renderer._tileMap;
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
          oldTileDefinition.hasFullHitBox(this._hitBoxTag);
        const haveFullHitBox =
          !!newTileDefinition &&
          newTileDefinition.hasFullHitBox(this._hitBoxTag);
        if (hadFullHitBox !== haveFullHitBox) {
          this._collisionTileMap.invalidateTile(
            this._layerIndex,
            columnIndex,
            rowIndex
          );
        }
      }
      this._isTileMapDirty = true;
      this.invalidateHitboxes();
    }

    flipTileOnYAtPosition(x: float, y: float, flip: boolean) {
      const [
        columnIndex,
        rowIndex,
      ] = this.getGridCoordinatesFromSceneCoordinates(x, y);
      this.flipTileOnYAtGridCoordinates(columnIndex, rowIndex, flip);
    }

    flipTileOnXAtPosition(x: float, y: float, flip: boolean) {
      const [
        columnIndex,
        rowIndex,
      ] = this.getGridCoordinatesFromSceneCoordinates(x, y);
      this.flipTileOnXAtGridCoordinates(columnIndex, rowIndex, flip);
    }

    flipTileOnYAtGridCoordinates(
      columnIndex: integer,
      rowIndex: integer,
      flip: boolean
    ) {
      this._renderer.flipTileOnY(columnIndex, rowIndex, 0, flip);
      this._isTileMapDirty = true;
      // No need to invalidate hit boxes since at the moment, collision mask
      // cannot be configured on each tile.
    }

    flipTileOnXAtGridCoordinates(
      columnIndex: integer,
      rowIndex: integer,
      flip: boolean
    ) {
      this._renderer.flipTileOnX(columnIndex, rowIndex, 0, flip);
      this._isTileMapDirty = true;
      // No need to invalidate hit boxes since at the moment, collision mask
      // cannot be configured on each tile.
    }

    isTileFlippedOnXAtPosition(x: float, y: float) {
      const [
        columnIndex,
        rowIndex,
      ] = this.getGridCoordinatesFromSceneCoordinates(x, y);

      return this._renderer.isTileFlippedOnX(columnIndex, rowIndex, 0);
    }

    isTileFlippedOnXAtGridCoordinates(columnIndex: integer, rowIndex: integer) {
      return this._renderer.isTileFlippedOnX(columnIndex, rowIndex, 0);
    }

    isTileFlippedOnYAtPosition(x: float, y: float) {
      const [
        columnIndex,
        rowIndex,
      ] = this.getGridCoordinatesFromSceneCoordinates(x, y);

      return this._renderer.isTileFlippedOnY(columnIndex, rowIndex, 0);
    }

    isTileFlippedOnYAtGridCoordinates(columnIndex: integer, rowIndex: integer) {
      return this._renderer.isTileFlippedOnY(columnIndex, rowIndex, 0);
    }

    removeTileAtPosition(x: float, y: float) {
      const [
        columnIndex,
        rowIndex,
      ] = this.getGridCoordinatesFromSceneCoordinates(x, y);
      this.removeTileAtGridCoordinates(columnIndex, rowIndex);
    }

    removeTileAtGridCoordinates(columnIndex: integer, rowIndex: integer) {
      const tileMap = this._renderer._tileMap;
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
        this._collisionTileMap.invalidateTile(
          this._layerIndex,
          columnIndex,
          rowIndex
        );
      }
      this._isTileMapDirty = true;
      this.invalidateHitboxes();
    }

    setGridRowCount(targetRowCount: integer) {
      if (targetRowCount <= 0) return;
      this._renderer.setGridRowCount(targetRowCount);
      this._isTileMapDirty = true;
      this.invalidateHitboxes();
    }

    setGridColumnCount(targetColumnCount: integer) {
      if (targetColumnCount <= 0) return;
      this._renderer.setGridColumnCount(targetColumnCount);
      this._isTileMapDirty = true;
      this.invalidateHitboxes();
    }

    getGridRowCount(): integer {
      return this._renderer.getGridRowCount();
    }

    getGridColumnCount(): integer {
      return this._renderer.getGridColumnCount();
    }

    getTilesetColumnCount(): integer {
      return this._columnCount;
    }

    getTilesetRowCount(): integer {
      return this._rowCount;
    }
  }
  gdjs.registerObject(
    'TileMap::SimpleTileMap',
    gdjs.SimpleTileMapRuntimeObject
  );
}
