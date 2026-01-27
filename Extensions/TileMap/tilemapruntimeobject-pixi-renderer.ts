/// <reference path="helper/TileMapHelper.d.ts" />
/// <reference path="pixi-tilemap/dist/pixi-tilemap.d.ts" />
namespace gdjs {
  /**
   * The PIXI.js renderer for the Tile map runtime object.
   *
   * @class TileMapRuntimeObjectPixiRenderer
   * @category Renderers > Tile Map
   */
  export class TileMapRuntimeObjectPixiRenderer {
    private _object:
      | gdjs.TileMapRuntimeObject
      | gdjs.SimpleTileMapRuntimeObject;

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

    updatePosition(): void {
      this._pixiObject.pivot.x = this._object.getTileMapWidth() / 2;
      this._pixiObject.pivot.y = this._object.getTileMapHeight() / 2;
      this._pixiObject.position.x = this._object.x + this.getWidth() / 2;
      this._pixiObject.position.y = this._object.y + this.getHeight() / 2;
    }

    updateAngle(): void {
      this._pixiObject.rotation = gdjs.toRad(this._object.angle);
    }

    updateOpacity(): void {
      const newAlpha = this._object._opacity / 255;
      if (this._pixiObject.alpha === newAlpha) {
        return;
      }

      this._pixiObject.alpha = newAlpha;
      const tileMap = this._object.getTileMap();
      if (!tileMap) return;
      for (const layer of tileMap.getLayers()) {
        const isLayerHidden =
          (this._object._displayMode === 'index' &&
            this._object._layerIndex !== layer.id) ||
          (this._object._displayMode === 'visible' && !layer.isVisible());

        // Only set alpha on editable layers that are not hidden,
        // as others are not rendered.
        if (isLayerHidden) continue;
        if (layer instanceof TileMapHelper.EditableTileMapLayer) {
          layer.setAlpha(this._pixiObject.alpha);
        }
      }

      // Changing the alpha requires a full re-render of the tile map.
      this._object.updateTileMap();
    }

    setWidth(width: float): void {
      this._pixiObject.scale.x = width / this._object.getTileMapWidth();
      this._pixiObject.position.x = this._object.x + width / 2;
    }

    setHeight(height: float): void {
      this._pixiObject.scale.y = height / this._object.getTileMapHeight();
      this._pixiObject.position.y = this._object.y + height / 2;
    }

    setScaleX(scaleX: float): void {
      this._pixiObject.scale.x = scaleX;
      const width = scaleX * this._object.getTileMapWidth();
      this._pixiObject.position.x = this._object.x + width / 2;
    }

    setScaleY(scaleY: float): void {
      this._pixiObject.scale.y = scaleY;
      const height = scaleY * this._object.getTileMapHeight();
      this._pixiObject.position.y = this._object.y + height / 2;
    }

    getWidth(): float {
      return this._object.getTileMapWidth() * this._pixiObject.scale.x;
    }

    getHeight(): float {
      return this._object.getTileMapHeight() * this._pixiObject.scale.y;
    }

    getScaleX(): float {
      return this._pixiObject.scale.x;
    }

    getScaleY(): float {
      return this._pixiObject.scale.y;
    }

    refreshPixiTileMap(textureCache: TileMapHelper.TileTextureCache) {
      const tileMap = this._object.getTileMap();
      if (!tileMap) return;
      TileMapHelper.PixiTileMapHelper.updatePixiTileMap(
        this._pixiObject,
        tileMap,
        textureCache,
        // @ts-ignore
        this._object._displayMode,
        this._object._layerIndex
      );
    }

    destroy(): void {
      // Keep textures because they are shared by all tile maps.
      this._pixiObject.destroy(false);
    }
  }
  /**
   * @category Renderers > Tile Map
   */
  export const TileMapRuntimeObjectRenderer =
    gdjs.TileMapRuntimeObjectPixiRenderer;
  /**
   * @category Renderers > Tile Map
   */
  export type TileMapRuntimeObjectRenderer =
    gdjs.TileMapRuntimeObjectPixiRenderer;
}
