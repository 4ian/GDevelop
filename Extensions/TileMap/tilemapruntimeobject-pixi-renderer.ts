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
      // TODO: Currently, the renderer does not use the object alpha to set
      // opacity. Setting alpha on each layer tile might not be useful as
      // each layer would be separately transparent instead of the whole tilemap.
      this._pixiObject.alpha = this._object._opacity / 255;
      const tileMap = this._object.getTileMap();
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
        this._displayMode,
        this._object._layerIndex
      );
    }

    destroy(): void {
      // Keep textures because they are shared by all tile maps.
      this._pixiObject.destroy(false);
    }
  }
  export const TileMapRuntimeObjectRenderer =
    gdjs.TileMapRuntimeObjectPixiRenderer;
  export type TileMapRuntimeObjectRenderer =
    gdjs.TileMapRuntimeObjectPixiRenderer;
}
