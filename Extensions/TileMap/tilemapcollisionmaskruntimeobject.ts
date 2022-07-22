/// <reference path="helper/TileMapHelper.d.ts" />
namespace gdjs {
  const logger = new gdjs.Logger('Tilemap object');

  /**
   * An object that handle hitboxes for a tile map.
   * @extends gdjs.RuntimeObject
   */
  export class TileMapCollisionMaskRuntimeObject extends gdjs.RuntimeObject {
    private _tilemapJsonFile: string;
    private _tilesetJsonFile: string;
    private _renderer: gdjs.TileMap.TileMapCollisionMaskRenderer;
    _collisionTileMap: gdjs.TileMap.TransformedCollisionTileMap;
    /**
     * The tiles are filtered according to this tag.
     *
     * This allows have multiple objects with different usage
     * for the same tile map.
     * For instance, platforms, jumpthru, ladder, spike, water...
     */
    private _collisionMaskTag: string;
    private _tileMapManager: gdjs.TileMap.TileMapRuntimeManager;

    /**
     * When set to true, the hitboxes will be shown.
     */
    _debugMode: boolean;
    _fillColor: integer;
    _outlineColor: integer;
    _fillOpacity: float;
    _outlineOpacity: float;
    _outlineSize: float;

    _width: float;
    _height: float;
    _scaleX: float;
    _scaleY: float;

    /**
     * If the owner moves, the hitboxes vertices
     * will have to be transformed again.
     */
    private _transformationIsUpToDate: boolean = false;

    constructor(runtimeScene: gdjs.RuntimeScene, objectData) {
      super(runtimeScene, objectData);
      this._tilemapJsonFile = objectData.content.tilemapJsonFile;
      this._tilesetJsonFile = objectData.content.tilesetJsonFile;
      this._collisionMaskTag = objectData.content.collisionMaskTag;
      this._debugMode = objectData.content.debugMode;
      this._fillColor = gdjs.rgbOrHexStringToNumber(
        objectData.content.fillColor
      );
      this._outlineColor = gdjs.rgbOrHexStringToNumber(
        objectData.content.outlineColor
      );
      this._fillOpacity = objectData.content.fillOpacity;
      this._outlineOpacity = objectData.content.outlineOpacity;
      this._outlineSize = objectData.content.outlineSize;
      this._tileMapManager = gdjs.TileMap.TileMapRuntimeManager.getManager(
        runtimeScene
      );

      // The actual size is set when the tile map file is loaded.
      this._width = 0;
      this._height = 0;
      this._scaleX = 1;
      this._scaleY = 1;
      const editableTileMap = new TileMapHelper.EditableTileMap(
        1,
        1,
        0,
        0,
        new Map()
      );
      this._collisionTileMap = new gdjs.TileMap.TransformedCollisionTileMap(
        editableTileMap,
        this._collisionMaskTag
      );

      this._renderer = new gdjs.TileMap.TileMapCollisionMaskRenderer(
        this,
        runtimeScene
      );
      this._updateTileMap();

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    getVisibilityAABB() {
      return null;
    }

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
      if (oldObjectData.content.debugMode !== newObjectData.content.debugMode) {
        this.setDebugMode(newObjectData.content.debugMode);
      }
      if (oldObjectData.content.fillColor !== newObjectData.content.fillColor) {
        this.setFillColor(
          gdjs.rgbOrHexStringToNumber(newObjectData.content.fillColor)
        );
      }
      if (
        oldObjectData.content.outlineColor !==
        newObjectData.content.outlineColor
      ) {
        this.setOutlineColor(
          gdjs.rgbOrHexStringToNumber(newObjectData.content.outlineColor)
        );
      }
      if (oldObjectData.fillOpacity !== newObjectData.fillOpacity) {
        this.setFillOpacity(newObjectData.fillOpacity);
      }
      if (oldObjectData.outlineOpacity !== newObjectData.outlineOpacity) {
        this.setOutlineOpacity(newObjectData.outlineOpacity);
      }
      if (oldObjectData.outlineSize !== newObjectData.outlineSize) {
        this.setOutlineSize(newObjectData.outlineSize);
      }
      return true;
    }

    extraInitializationFromInitialInstance(initialInstanceData): void {
      if (initialInstanceData.customSize) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
      }
    }

    private _updateTileMap(): void {
      this._tileMapManager.getOrLoadTileMap(
        this._tilemapJsonFile,
        this._tilesetJsonFile,
        (tileMap: TileMapHelper.EditableTileMap | null) => {
          if (!tileMap) {
            // getOrLoadTileMap already log errors.
            return;
          }

          this._collisionTileMap = new gdjs.TileMap.TransformedCollisionTileMap(
            tileMap,
            this._collisionMaskTag
          );
          // The tile map polygons always keep the same references.
          // It works because the tilemap is never modified.
          this.hitBoxes = Array.from(
            this._collisionTileMap.getAllHitboxes(this._collisionMaskTag)
          );
          this._renderer.redrawCollisionMask();

          this._width = this._collisionTileMap.getWidth() * this._scaleX;
          this._height = this._collisionTileMap.getHeight() * this._scaleY;
        }
      );
    }

    updateHitBoxes(): void {
      this.updateTransformation();
      // Update the RuntimeObject hitboxes attribute.
      for (const hitboxes of this._collisionTileMap.getAllHitboxes(
        this._collisionMaskTag
      )) {
        // RuntimeObject.hitBoxes contains the same polygons instances as the
        // hitboxes from the tiles.
        //
        // When hitboxes for a tile is asked to the model, they are updated
        // according to the new object location if needed.
        // Iterating over all the tiles forces them to update their hitboxes.
        //
        // The hitboxes array is built by _updateTileMap().
      }
      this.hitBoxesDirty = false;
      this._renderer.redrawCollisionMask();
      this.updateAABB();
    }

    /**
     * Update the affine transformation according to the object position, size
     *  and angle.
     */
    updateTransformation(): void {
      if (this._transformationIsUpToDate) {
        return;
      }
      const transformation = this._collisionTileMap.getTransformation();

      const absScaleX = Math.abs(this._scaleX);
      const absScaleY = Math.abs(this._scaleY);

      transformation.setToIdentity();

      // Translation
      transformation.translate(this.x, this.y);

      // Rotation
      const angleInRadians = (this.angle * Math.PI) / 180;
      transformation.rotateAround(
        angleInRadians,
        this.getCenterX(),
        this.getCenterY()
      );

      // Scale
      transformation.scale(absScaleX, absScaleY);

      this._collisionTileMap.setTransformation(transformation);

      this._transformationIsUpToDate = true;
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

    getHitBoxesAround(left: float, top: float, right: float, bottom: float) {
      // This implementation doesn't call updateHitBoxes.
      // It's important for good performances because there is no need to
      // update the whole collision mask where only a few hitboxes must be
      // checked.
      this.updateTransformation();
      return this._collisionTileMap.getHitboxesAround(
        this._collisionMaskTag,
        left,
        top,
        right,
        bottom
      );
    }

    /**
     * insideObject usually use the AABB of the object.
     * But, in case of a tile map, it makes more sense to look each tile individually.
     * It returns true when there is an hitbox in the tile.
     */
    insideObject(x: float, y: float): boolean {
      this.updateTransformation();
      // This is more precise than the default implementation.
      return this._collisionTileMap.pointIsInsideTile(
        x,
        y,
        this._collisionMaskTag
      );
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

    /**
     * Set the Tilemap json file to display.
     */
    setTilemapJsonFile(tilemapJsonFile: string): void {
      this._tilemapJsonFile = tilemapJsonFile;
      this._updateTileMap();
    }

    getTilemapJsonFile(): string {
      return this._tilemapJsonFile;
    }

    isTilemapJsonFile(selectedTilemapJsonFile: string): boolean {
      return this._tilemapJsonFile === selectedTilemapJsonFile;
    }

    setTilesetJsonFile(tilesetJsonFile: string) {
      this._tilesetJsonFile = tilesetJsonFile;
      this._updateTileMap();
    }

    getTilesetJsonFile(): string {
      return this._tilesetJsonFile;
    }

    isTilesetJsonFile(selectedTilesetJsonFile: string): boolean {
      return this._tilesetJsonFile === selectedTilesetJsonFile;
    }

    /**
     * @returns true if the hitboxes are shown.
     */
    getDebugMode(): boolean {
      return this._debugMode;
    }

    /**
     * @returns true if the hitboxes are shown.
     */
    setDebugMode(debugMode: boolean): void {
      this._debugMode = debugMode;
      this._renderer.redrawCollisionMask();
    }

    getFillColor(): integer {
      return this._fillColor;
    }

    getOutlineColor(): integer {
      return this._outlineColor;
    }

    setFillColor(fillColor: integer): void {
      this._fillColor = fillColor;
    }

    setOutlineColor(outlineColor: integer): void {
      this._outlineColor = outlineColor;
    }

    setOutlineSize(size: float): void {
      this._outlineSize = size;
    }

    getOutlineSize(): float {
      return this._outlineSize;
    }

    /**
     *
     * @param opacity from 0 to 255
     */
    setFillOpacity(opacity: float): void {
      this._fillOpacity = opacity;
    }

    /**
     *
     * @returns an opacity value from 0 to 255.
     */
    getFillOpacity(): float {
      return this._fillOpacity;
    }

    /**
     *
     * @param opacity from 0 to 255
     */
    setOutlineOpacity(opacity: float): void {
      this._outlineOpacity = opacity;
    }

    /**
     *
     * @returns an opacity value from 0 to 255.
     */
    getOutlineOpacity(): float {
      return this._outlineOpacity;
    }

    setX(x: float): void {
      super.setX(x);
      this._transformationIsUpToDate = false;
    }

    setY(y: float): void {
      super.setY(y);
      this._transformationIsUpToDate = false;
    }

    setAngle(angle: float): void {
      super.setAngle(angle);
      this._transformationIsUpToDate = false;
    }

    // TODO allow size changes from events?

    setWidth(width: float): void {
      if (this._width === width) return;
      this._scaleX = width / this._collisionTileMap.getWidth();
      this._width = width;
      this.hitBoxesDirty = true;
      this._transformationIsUpToDate = false;
    }

    setHeight(height: float): void {
      if (this._height === height) return;
      this._scaleY = height / this._collisionTileMap.getHeight();
      this._height = height;
      this.hitBoxesDirty = true;
      this._transformationIsUpToDate = false;
    }

    getWidth(): float {
      return this._width;
    }

    getHeight(): float {
      return this._height;
    }
  }
  gdjs.registerObject(
    'TileMap::CollisionMask',
    gdjs.TileMapCollisionMaskRuntimeObject
  );
  TileMapCollisionMaskRuntimeObject.supportsReinitialization = false;
}
