/// <reference path="helper/TileMapHelper.d.ts" />
namespace gdjs {
  /**
   * Displays a Tilemap object (LDtk and Tiled).
   * @category Objects > Tile Map
   */
  export abstract class AbstractTileMapRuntimeObject extends gdjs.RuntimeObject {
    /**
     * A reusable Point to avoid allocations.
     */
    private static readonly workingPoint: FloatPoint = [0, 0];

    private _sceneToTileMapTransformation: gdjs.AffineTransformation =
      new gdjs.AffineTransformation();
    private _tileMapToSceneTransformation: gdjs.AffineTransformation =
      new gdjs.AffineTransformation();
    private _transformationIsUpToDate: boolean = false;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: ObjectData,
      instanceData?: InstanceData
    ) {
      super(instanceContainer, objectData, instanceData);
    }

    abstract getTileMap(): TileMapHelper.EditableTileMap | null;

    /**
     * Return a tile map that is safe to modify.
     */
    abstract getTileMapForEdition(): TileMapHelper.EditableTileMap | null;

    abstract getCollisionTileMap(): gdjs.TileMap.TransformedCollisionTileMap | null;

    abstract getLayerIndex(): integer;

    abstract getCollisionMaskTag(): string;

    abstract getScaleX(): float;

    abstract getScaleY(): float;

    abstract invalidateTileMap(): void;

    invalidateTransformation(): void {
      this._transformationIsUpToDate = false;
    }

    getGridRowCount(): integer {
      const tileMap = this.getTileMap();
      return tileMap ? tileMap.getDimensionY() : 0;
    }

    getGridColumnCount(): integer {
      const tileMap = this.getTileMap();
      return tileMap ? tileMap.getDimensionX() : 0;
    }

    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param layerIndex The layer index.
     * @returns The tile's id.
     */
    getTileId(x: integer, y: integer, layerIndex: integer): integer {
      const tileMap = this.getTileMap();
      if (!tileMap) return -1;
      return tileMap.getTileId(x, y, layerIndex);
    }

    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param layerIndex The layer index.
     */
    isTileFlippedOnX(x: integer, y: integer, layerIndex: integer): boolean {
      const tileMap = this.getTileMap();
      if (!tileMap) return false;
      return tileMap.isTileFlippedOnX(x, y, layerIndex);
    }

    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param layerIndex The layer index.
     */
    isTileFlippedOnY(x: integer, y: integer, layerIndex: integer): boolean {
      const tileMap = this.getTileMap();
      if (!tileMap) return false;
      return tileMap.isTileFlippedOnY(x, y, layerIndex);
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
        Math.abs(this.getScaleX()),
        Math.abs(this.getScaleY())
      );
      const collisionTileMap = this.getCollisionTileMap();
      if (collisionTileMap) {
        const collisionTileMapTransformation =
          collisionTileMap.getTransformation();
        collisionTileMapTransformation.copyFrom(
          this._tileMapToSceneTransformation
        );
        collisionTileMap.setTransformation(collisionTileMapTransformation);
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
      const tileMap = this.getTileMap();
      if (!tileMap) {
        return 0;
      }
      const sceneCoordinates: FloatPoint =
        AbstractTileMapRuntimeObject.workingPoint;
      this._tileMapToSceneTransformation.transform(
        [
          (columnIndex + 0.5) * tileMap.getTileWidth(),
          (rowIndex + 0.5) * tileMap.getTileHeight(),
        ],
        sceneCoordinates
      );
      return sceneCoordinates[0];
    }

    getSceneYCoordinateOfTileCenter(
      columnIndex: integer,
      rowIndex: integer
    ): float {
      const tileMap = this.getTileMap();
      if (!tileMap) {
        return 0;
      }
      const sceneCoordinates: FloatPoint =
        AbstractTileMapRuntimeObject.workingPoint;
      this._tileMapToSceneTransformation.transform(
        [
          (columnIndex + 0.5) * tileMap.getTileWidth(),
          (rowIndex + 0.5) * tileMap.getTileHeight(),
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
      const result = AbstractTileMapRuntimeObject.workingPoint;
      const tileMap = this.getTileMap();
      if (!tileMap) {
        result[0] = 0;
        result[1] = 0;
        return result;
      }
      this._sceneToTileMapTransformation.transform([x, y], result);

      result[0] = Math.floor(result[0] / tileMap.getTileWidth());
      result[1] = Math.floor(result[1] / tileMap.getTileHeight());
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
      const layer = tileMap.getTileLayer(this.getLayerIndex());
      if (!layer) {
        return;
      }
      const oldTileId = layer.getTileId(columnIndex, rowIndex);
      if (tileId === oldTileId) {
        return;
      }
      layer.setTile(columnIndex, rowIndex, tileId);

      const collisionTileMap = this.getCollisionTileMap();
      if (collisionTileMap) {
        const oldTileDefinition =
          oldTileId !== undefined && tileMap.getTileDefinition(oldTileId);
        const newTileDefinition = tileMap.getTileDefinition(tileId);
        const hadFullHitBox =
          !!oldTileDefinition &&
          oldTileDefinition.hasFullHitBox(this.getCollisionMaskTag());
        const haveFullHitBox =
          !!newTileDefinition &&
          newTileDefinition.hasFullHitBox(this.getCollisionMaskTag());
        if (hadFullHitBox !== haveFullHitBox) {
          collisionTileMap.invalidateTile(
            this.getLayerIndex(),
            columnIndex,
            rowIndex
          );
        }
      }
      this.invalidateTileMap();
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
      this.invalidateTileMap();
      // No need to invalidate hit boxes since at the moment, collision mask
      // cannot be configured on each tile.
    }

    flipTileOnXAtGridCoordinates(
      columnIndex: integer,
      rowIndex: integer,
      flip: boolean
    ) {
      this.flipTileOnX(columnIndex, rowIndex, 0, flip);
      this.invalidateTileMap();
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
      const layer = tileMap.getTileLayer(this.getLayerIndex());
      if (!layer) {
        return;
      }
      const oldTileId = layer.getTileId(columnIndex, rowIndex);
      if (oldTileId === undefined) {
        return;
      }
      layer.removeTile(columnIndex, rowIndex);

      const collisionTileMap = this.getCollisionTileMap();
      if (collisionTileMap) {
        const oldTileDefinition =
          oldTileId !== undefined && tileMap.getTileDefinition(oldTileId);
        const hadFullHitBox =
          !!oldTileDefinition &&
          oldTileDefinition.hasFullHitBox(this.getCollisionMaskTag());
        if (hadFullHitBox) {
          collisionTileMap.invalidateTile(
            this.getLayerIndex(),
            columnIndex,
            rowIndex
          );
        }
      }
      this.invalidateTileMap();
    }

    setGridRowCount(targetRowCount: integer) {
      const tileMap = this.getTileMapForEdition();
      if (targetRowCount <= 0) return;
      if (!tileMap) return;
      tileMap.setDimensionY(targetRowCount);
      const collisionTileMap = this.getCollisionTileMap();
      if (collisionTileMap) {
        collisionTileMap.updateDimensions();
      }
      this.invalidateTileMap();
      this.invalidateHitboxes();
    }

    setGridColumnCount(targetColumnCount: integer) {
      const tileMap = this.getTileMapForEdition();
      if (targetColumnCount <= 0) return;
      if (!tileMap) return;
      tileMap.setDimensionX(targetColumnCount);
      const collisionTileMap = this.getCollisionTileMap();
      if (collisionTileMap) {
        collisionTileMap.updateDimensions();
      }
      this.invalidateTileMap();
      this.invalidateHitboxes();
    }
  }
}
