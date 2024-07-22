/// <reference path="helper/TileMapHelper.d.ts" />
/// <reference path="pixi-tilemap/dist/pixi-tilemap.d.ts" />
namespace gdjs {
  /**
   * The PIXI.js renderer for the Tile map runtime object.
   *
   * @class TileMapRuntimeObjectPixiRenderer
   */
  export class TileMapRuntimeObjectPixiRenderer {
    private _object:
      | gdjs.TileMapRuntimeObject
      | gdjs.SimpleTileMapRuntimeObject;
    private _tileMap: TileMapHelper.EditableTileMap | null = null;

    private _pixiObject: PIXI.tilemap.CompositeTilemap;

    /**
     * @param runtimeObject The object to render
     * @param instanceContainer The gdjs.RuntimeScene in which the object is
     */
    constructor(
      runtimeObject:
        | gdjs.TileMapRuntimeObject
        | gdjs.SimpleTileMapRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      this._object = runtimeObject;

      // This setting allows tile maps with more than 16K tiles.
      PIXI.tilemap.settings.use32bitIndex = true;

      // Load (or reset)
      this._pixiObject = new PIXI.tilemap.CompositeTilemap();
      this._pixiObject.tileAnim = [0, 0];

      instanceContainer
        .getLayer('')
        .getRenderer()
        .addRendererObject(this._pixiObject, runtimeObject.getZOrder());
      this.updateAngle();
      this.updateOpacity();
      this.updatePosition();
    }

    getRendererObject() {
      return this._pixiObject;
    }

    incrementAnimationFrameX(instanceContainer: gdjs.RuntimeInstanceContainer) {
      this._pixiObject.tileAnim[0] += 1;
    }

    updatePixiTileMap(
      tileMap: TileMapHelper.EditableTileMap,
      textureCache: TileMapHelper.TileTextureCache
    ) {
      this._tileMap = tileMap;
      TileMapHelper.PixiTileMapHelper.updatePixiTileMap(
        this._pixiObject,
        tileMap,
        textureCache,
        // @ts-ignore
        this._object._displayMode,
        this._object._layerIndex
      );
    }

    refreshPixiTileMap(textureCache: TileMapHelper.TileTextureCache) {
      if (!this._tileMap) return;
      TileMapHelper.PixiTileMapHelper.updatePixiTileMap(
        this._pixiObject,
        this._tileMap,
        textureCache,
        // @ts-ignore
        this._object._displayMode,
        this._object._layerIndex
      );
    }

    getTileMap(): TileMapHelper.EditableTileMap | null {
      return this._tileMap;
    }

    updatePosition(): void {
      this._pixiObject.pivot.x = this.getTileMapWidth() / 2;
      this._pixiObject.pivot.y = this.getTileMapHeight() / 2;
      this._pixiObject.position.x = this._object.x + this.getWidth() / 2;
      this._pixiObject.position.y = this._object.y + this.getHeight() / 2;
    }

    updateAngle(): void {
      this._pixiObject.rotation = gdjs.toRad(this._object.angle);
    }

    updateOpacity(): void {
      this._pixiObject.alpha = this._object._opacity / 255;
      const tileMap = this._tileMap;
      if (!tileMap) return;
      for (const layer of tileMap.getLayers()) {
        if (
          (this._object._displayMode === 'index' &&
            this._object._layerIndex !== layer.id) ||
          (this._object._displayMode === 'visible' && !layer.isVisible())
        ) {
          continue;
        }
        if (layer instanceof TileMapHelper.EditableTileMapLayer) {
          layer.setAlpha(this._pixiObject.alpha);
        }
      }
    }

    getTileMapWidth() {
      const tileMap = this._tileMap;
      return tileMap ? tileMap.getWidth() : 20;
    }

    getTileMapHeight() {
      const tileMap = this._tileMap;
      return tileMap ? tileMap.getHeight() : 20;
    }

    setWidth(width: float): void {
      this._pixiObject.scale.x = width / this.getTileMapWidth();
      this._pixiObject.position.x = this._object.x + width / 2;
    }

    setHeight(height: float): void {
      this._pixiObject.scale.y = height / this.getTileMapHeight();
      this._pixiObject.position.y = this._object.y + height / 2;
    }

    setScaleX(scaleX: float): void {
      this._pixiObject.scale.x = scaleX;
      const width = scaleX * this.getTileMapWidth();
      this._pixiObject.position.x = this._object.x + width / 2;
    }

    setScaleY(scaleY: float): void {
      this._pixiObject.scale.y = scaleY;
      const height = scaleY * this.getTileMapHeight();
      this._pixiObject.position.y = this._object.y + height / 2;
    }

    getWidth(): float {
      return this.getTileMapWidth() * this._pixiObject.scale.x;
    }

    getHeight(): float {
      return this.getTileMapHeight() * this._pixiObject.scale.y;
    }

    getScaleX(): float {
      return this._pixiObject.scale.x;
    }

    getScaleY(): float {
      return this._pixiObject.scale.y;
    }

    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param layerIndex The layer index.
     * @returns The tile's id.
     */
    getTileId(x: integer, y: integer, layerIndex: integer): integer {
      const tileMap = this._tileMap;
      if (!tileMap) return -1;
      const layer = tileMap.getTileLayer(layerIndex);
      if (!layer) return -1;
      return layer.getTileId(x, y) || -1;
    }

    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param layerIndex The layer index.
     * @param tileId The tile's id.
     */
    setTileId(x: integer, y: integer, layerIndex: integer, tileId: number) {
      const tileMap = this._tileMap;
      if (!tileMap) return;
      const layer = tileMap.getTileLayer(layerIndex);
      if (!layer) return;
      return layer.setTile(x, y, tileId);
    }

    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param layerIndex The layer index.
     * @param flip true if the tile should be flipped.
     */
    flipTileOnY(x: integer, y: integer, layerIndex: integer, flip: boolean) {
      const tileMap = this._tileMap;
      if (!tileMap) return;
      const layer = tileMap.getTileLayer(layerIndex);
      if (!layer) return;
      layer.setFlippedVertically(x, y, flip);
    }

    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param layerIndex The layer index.
     * @param flip true if the tile should be flipped.
     */
    flipTileOnX(x: integer, y: integer, layerIndex: integer, flip: boolean) {
      const tileMap = this._tileMap;
      if (!tileMap) return;
      const layer = tileMap.getTileLayer(layerIndex);
      if (!layer) return;
      layer.setFlippedHorizontally(x, y, flip);
    }

    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param layerIndex The layer index.
     */
    isTileFlippedOnX(x: integer, y: integer, layerIndex: integer): boolean {
      const tileMap = this._tileMap;
      if (!tileMap) return false;
      const layer = tileMap.getTileLayer(layerIndex);
      if (!layer) return false;
      return layer.isFlippedHorizontally(x, y);
    }

    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param layerIndex The layer index.
     */
    isTileFlippedOnY(x: integer, y: integer, layerIndex: integer): boolean {
      const tileMap = this._tileMap;
      if (!tileMap) return false;
      const layer = tileMap.getTileLayer(layerIndex);
      if (!layer) return false;
      return layer.isFlippedVertically(x, y);
    }

    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param layerIndex The layer index.
     */
    removeTile(x: integer, y: integer, layerIndex: integer) {
      const tileMap = this._tileMap;
      if (!tileMap) return;
      const layer = tileMap.getTileLayer(layerIndex);
      if (!layer) return;
      return layer.removeTile(x, y);
    }
    /**
     * @param layerIndex The layer index.
     */
    trimEmptyColumnsAndRows(layerIndex: integer) {
      const tileMap = this._tileMap;
      if (!tileMap) return;
      const layer = tileMap.getTileLayer(layerIndex);
      if (!layer) return;
      return layer.trimEmptyColumnsAndRow();
    }

    destroy(): void {
      // Keep textures because they are shared by all tile maps.
      this._pixiObject.destroy(false);
    }
  }
  export const TileMapRuntimeObjectRenderer =
    gdjs.TileMapRuntimeObjectPixiRenderer;
  export type TileMapRuntimeObjectRenderer = gdjs.TileMapRuntimeObjectPixiRenderer;
}
