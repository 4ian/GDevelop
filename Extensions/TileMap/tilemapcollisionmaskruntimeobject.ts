/// <reference path="helper/TileMapHelper.d.ts" />
namespace gdjs {
  const logger = new gdjs.Logger('Tilemap object');

  /**
   * An object that handle hitboxes for a tile map.
   * @extends gdjs.RuntimeObject
   */
  export class TileMapCollisionMaskRuntimeObject extends gdjs.RuntimeObject {
    _tilemapJsonFile: string;
    _tilesetJsonFile: string;
    _layerIndex: integer;
    _renderer: gdjs.TileMap.TileMapCollisionMaskRender;
    _collisionTileMap: gdjs.TileMap.TransformedCollisionTileMap;
    /**
     * The tiles are filtered according to this tag.
     *
     * This allows have multiple objects with different usage
     * for the same tile map.
     * For instance, platforms, jumpthru, ladder, spike, water...
     */
    _typeFilter: string;
    _tileMapManager: gdjs.TileMap.TileMapRuntimeManager;

    /**
     * When set to true, the hitboxes will be shown.
     */
    _debugMode: boolean;
    _fillColor: integer;
    _outlineColor: integer;
    _fillOpacity: float;
    _outlineOpacity: float;
    _outlineSize: float;

    /**
     * If the owner moves, the hitboxes vertices
     * will have to be transformed again.
     */
    _transformationIsUpToDate: boolean = false;

    constructor(runtimeScene: gdjs.RuntimeScene, objectData) {
      super(runtimeScene, objectData);
      this._tilemapJsonFile = objectData.content.tilemapJsonFile;
      this._tilesetJsonFile = objectData.content.tilesetJsonFile;
      this._layerIndex = objectData.content.layerIndex;
      this._typeFilter = objectData.content.typeFilter;
      this._debugMode = objectData.content.debugMode;
      this._fillColor = this.rgbToNumber(
        gdjs.rgbOrHexToRGBColor(objectData.content.fillColor)
      );
      this._outlineColor = this.rgbToNumber(
        gdjs.rgbOrHexToRGBColor(objectData.content.outlineColor)
      );
      this._fillOpacity = objectData.content.fillOpacity;
      this._outlineOpacity = objectData.content.outlineOpacity;
      this._outlineSize = objectData.content.outlineSize;
      this._tileMapManager = gdjs.TileMap.TileMapRuntimeManager.getManager(
        runtimeScene
      );
      const collisionTileMap = new TileMapHelper.EditableTileMap(
        1,
        1,
        0,
        0,
        new Map()
      );
      this._collisionTileMap = new gdjs.TileMap.TransformedCollisionTileMap(
        collisionTileMap,
        this._typeFilter
      );
      this._renderer = new gdjs.TileMap.TileMapCollisionMaskRender(
        this,
        runtimeScene
      );
      this._updateTileMap();

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    rgbToNumber = function (components: [integer, integer, integer]): integer {
      return (components[0] << 16) + (components[1] << 8) + components[2];
    };

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
      if (
        oldObjectData.content.layerIndex !== newObjectData.content.layerIndex
      ) {
        this.setLayerIndex(newObjectData.content.layerIndex);
      }
      if (oldObjectData.content.debugMode !== newObjectData.content.debugMode) {
        this.setDebugMode(newObjectData.content.debugMode);
      }
      if (oldObjectData.content.fillColor !== newObjectData.content.fillColor) {
        this.setFillColor(
          this.rgbToNumber(
            gdjs.rgbOrHexToRGBColor(newObjectData.content.fillColor)
          )
        );
      }
      if (
        oldObjectData.content.outlineColor !==
        newObjectData.content.outlineColor
      ) {
        this.setOutlineColor(
          this.rgbToNumber(
            gdjs.rgbOrHexToRGBColor(newObjectData.content.outlineColor)
          )
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
            this._typeFilter
          );
          // The tile map polygons always keep the same references.
          // TODO Update them if an action modify the tile map.
          this.hitBoxes = Array.from(
            this._collisionTileMap.getAllHitboxes(this._typeFilter)
          );
          this.updateHitBoxes();
        }
      );
    }

    updateHitBoxes(): void {
      //console.log("updateHitBoxes");
      this.updateTransformation();
      for (const hitboxes of this._collisionTileMap.getAllHitboxes(
        this._typeFilter
      )) {
        // just make them refresh
      }
      this.hitBoxesDirty = false;
      this._renderer.redrawCollisionMask();
      this.updateAABB();
    }

    updateTransformation() {
      if (this._transformationIsUpToDate) {
        return;
      }
      const transformation = this._collisionTileMap.getTransformation();

      const absScaleX = Math.abs(this._renderer.getScaleX());
      const absScaleY = Math.abs(this._renderer.getScaleY());

      transformation.setToIdentity();

      // Translation
      transformation.translate(this.x, this.y);

      // Rotation
      const angleInRadians = (this.angle * Math.PI) / 180;
      transformation.rotateAround(
        angleInRadians,
        this.getCenterX() * absScaleX,
        this.getCenterY() * absScaleY
      );

      // Scale
      transformation.scale(absScaleX, absScaleY);

      this._collisionTileMap.setTransformation(transformation);

      this._transformationIsUpToDate = true;
    }

    getHitBoxes(): gdjs.Polygon[] {
      if (this.hitBoxesDirty) {
        this.updateHitBoxes();
        this.updateAABB();
        this.hitBoxesDirty = false;
      }
      return this.hitBoxes;
    }

    // This implementation doesn't use updateHitBoxes.
    // It's important for good performances.
    getHitBoxesAround(left: float, top: float, right: float, bottom: float) {
      if (this.hitBoxesDirty) {
        this.updateHitBoxes();
        this.updateAABB();
        this.hitBoxesDirty = false;
      }
      return this._collisionTileMap.getHitboxesAround(
        this._typeFilter,
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
      return this._collisionTileMap.pointIsInsideTile(x, y, this._typeFilter);
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

        //console.log(this._typeFilter + " aabb: " + this.aabb.min + " " + this.aabb.max);
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

    getTilemapJsonFile() {
      return this._tilemapJsonFile;
    }

    isTilemapJsonFile(selectedTilemapJsonFile: string): boolean {
      return this._tilemapJsonFile === selectedTilemapJsonFile;
    }

    setTilesetJsonFile(tilesetJsonFile: string) {
      this._tilesetJsonFile = tilesetJsonFile;
      this._updateTileMap();
    }

    getTilesetJsonFile() {
      return this._tilesetJsonFile;
    }

    isTilesetJsonFile(selectedTilesetJsonFile: string) {
      return this._tilesetJsonFile === selectedTilesetJsonFile;
    }

    setLayerIndex(layerIndex: integer): void {
      this._layerIndex = layerIndex;
      // TODO actually filter on a layer?
      // It's probably easier too use without it.
      this._updateTileMap();
    }

    getLayerIndex() {
      return this._layerIndex;
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

    getOutlineSize() {
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
    getFillOpacity() {
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
    getOutlineOpacity() {
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

    /**
     * Set the width of the object.
     * @param width The new width.
     */
    setWidth(width: float): void {
      if (this._renderer.getWidth() === width) return;

      this._renderer.setWidth(width);
      this.hitBoxesDirty = true;
      this._transformationIsUpToDate = false;
    }

    /**
     * Set the height of the object.
     * @param height The new height.
     */
    setHeight(height: float): void {
      if (this._renderer.getHeight() === height) return;

      this._renderer.setHeight(height);
      this.hitBoxesDirty = true;
      this._transformationIsUpToDate = false;
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
