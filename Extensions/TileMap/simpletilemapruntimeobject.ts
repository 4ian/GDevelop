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
    _initialTilesWithHitBox: number[];
    _isTileMapDirty: boolean = false;
    _sceneToTileMapTransformation: gdjs.AffineTransformation = new gdjs.AffineTransformation();
    _collisionTileMap: gdjs.TileMap.TransformedCollisionTileMap | null = null;
    _hitBoxTag: string = 'collision';
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

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    updatePreRender(instanceContainer: gdjs.RuntimeInstanceContainer): void {
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
      const tileMap = this._loadInitialTileMap();

      // 3. Set custom dimensions if applicable.
      if (initialInstanceData.customSize) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
      }

      // 4. Update position (calculations based on renderer's dimensions).
      this._renderer.updatePosition();

      this._collisionTileMap = new gdjs.TileMap.TransformedCollisionTileMap(
        tileMap,
        this._hitBoxTag
      );
      this.updateTransformation();
    }

    private _loadInitialTileMap(): TileMapHelper.EditableTileMap {
      const tileMap = TileMapHelper.EditableTileMap.from(
        this._initialTileMapAsJsObject,
        {
          tileSize: this._tileSize,
          columnCount: this._columnCount,
          rowCount: this._rowCount,
        }
      );
      this._initialTilesWithHitBox.forEach((tileId) => {
        const tileDefinition = tileMap.getTileDefinition(tileId);
        if (!tileDefinition) {
          console.warn(
            `Could not set hit box for tile with id ${tileId}. Continuing.`
          );
          return;
        }
        tileDefinition.addHitBox(this._hitBoxTag, [
          [0, 0],
          [0, tileMap.getTileHeight()],
          [tileMap.getTileWidth(), tileMap.getTileHeight()],
          [tileMap.getTileWidth(), 0],
        ]);
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
        }
      );
      return tileMap;
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
      // Update the RuntimeObject hitboxes attribute.
      for (const _ of this._collisionTileMap.getAllHitboxes(this._hitBoxTag)) {
        // RuntimeObject.hitBoxes contains the same polygons instances as the
        // hitboxes from the tiles.
        //
        // When hitboxes for a tile is asked to the model, they are updated
        // according to the new object location if needed.
        // Iterating over all the tiles forces them to update their hitboxes.
        //
        // The hitboxes array is built by _loadInitialTileMap().
      }
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
      const absScaleX = Math.abs(this._renderer.getScaleX());
      const absScaleY = Math.abs(this._renderer.getScaleY());

      this._sceneToTileMapTransformation.setToIdentity();

      // Translation
      this._sceneToTileMapTransformation.translate(this.getX(), this.getY());

      // Rotation
      const angleInRadians = (this.getAngle() * Math.PI) / 180;
      this._sceneToTileMapTransformation.rotateAround(
        angleInRadians,
        this.getCenterX(),
        this.getCenterY()
      );

      // Scale
      this._sceneToTileMapTransformation.scale(absScaleX, absScaleY);
      if (this._collisionTileMap) {
        const collisionTileMapTransformation = this._collisionTileMap.getTransformation();
        collisionTileMapTransformation.copyFrom(
          this._sceneToTileMapTransformation
        );
        this._collisionTileMap.setTransformation(
          collisionTileMapTransformation
        );
      }
      this._sceneToTileMapTransformation.invert();
    }

    getGridCoordinatesFromSceneCoordinates(
      x: number,
      y: number
    ): [number, number] {
      this.updateTransformation();

      const gridCoordinates: FloatPoint =
        SimpleTileMapRuntimeObject.workingPoint;
      this._sceneToTileMapTransformation.transform([x, y], gridCoordinates);

      const columnIndex = Math.floor(gridCoordinates[0] / this._tileSize);
      const rowIndex = Math.floor(gridCoordinates[1] / this._tileSize);

      return [columnIndex, rowIndex];
    }

    getTileAt(x: number, y: number): integer {
      const [
        columnIndex,
        rowIndex,
      ] = this.getGridCoordinatesFromSceneCoordinates(x, y);
      return this._renderer.getTileId(columnIndex, rowIndex, 0);
    }

    setTileAt(
      tileId: number,
      x: number,
      y: number,
      flipHorizontally: boolean,
      flipVertically: boolean
    ) {
      const [
        columnIndex,
        rowIndex,
      ] = this.getGridCoordinatesFromSceneCoordinates(x, y);
      const addedData = this._renderer.setTileId(
        columnIndex,
        rowIndex,
        0,
        tileId,
        { flipHorizontally, flipVertically, flipDiagonally: false }
      );
      this._isTileMapDirty = true;
      if (addedData) {
        const {
          unshiftedRows,
          unshiftedColumns,
          appendedColumns,
          appendedRows,
        } = addedData;
        const scaleX = this.getScaleX();
        const scaleY = this.getScaleY();
        this.setX(this.getX() - unshiftedColumns * (this._tileSize * scaleX));
        this.setY(this.getY() - unshiftedRows * (this._tileSize * scaleY));
        if (
          unshiftedColumns > 0 ||
          unshiftedRows > 0 ||
          appendedColumns > 0 ||
          appendedRows > 0
        ) {
          this.invalidateHitboxes();
        }
      }
    }

    removeTileAt(x: number, y: number) {
      const [
        columnIndex,
        rowIndex,
      ] = this.getGridCoordinatesFromSceneCoordinates(x, y);
      this._renderer.removeTile(columnIndex, rowIndex, 0);
      this._isTileMapDirty = true;
      const removedData = this._renderer.trimEmptyColumnsAndRows(0);
      if (removedData) {
        const {
          shiftedRows,
          shiftedColumns,
          poppedColumns,
          poppedRows,
        } = removedData;
        this.setX(
          this.getX() + shiftedColumns * (this._tileSize * this.getScaleX())
        );
        this.setY(
          this.getY() + shiftedRows * (this._tileSize * this.getScaleY())
        );
        if (
          shiftedColumns > 0 ||
          shiftedRows > 0 ||
          poppedColumns > 0 ||
          poppedRows > 0
        ) {
          this.invalidateHitboxes();
        }
      }
    }
  }
  gdjs.registerObject(
    'TileMap::SimpleTileMap',
    gdjs.SimpleTileMapRuntimeObject
  );
}