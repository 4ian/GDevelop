/// <reference path="helper/TileMapHelper.d.ts" />
/// <reference path="pixi-tilemap/dist/pixi-tilemap.d.ts" />
namespace gdjs {
  const logger = new gdjs.Logger('Tilemap object');

  /**
   * The PIXI.js renderer for the Tile map runtime object.
   *
   * @class TileMapRuntimeObjectPixiRenderer
   */
  export class TileMapRuntimeObjectPixiRenderer {
    _object: any;
    _runtimeScene: gdjs.RuntimeScene;

    _pixiObject: PIXI.tilemap.CompositeRectTileLayer;

    /**
     * @param runtimeObject The object to render
     * @param runtimeScene The gdjs.RuntimeScene in which the object is
     */
    constructor(
      runtimeObject: gdjs.TileMapRuntimeObject,
      runtimeScene: gdjs.RuntimeScene
    ) {
      this._object = runtimeObject;
      this._runtimeScene = runtimeScene;

      // Load (or reset)
      this._pixiObject = new PIXI.tilemap.CompositeRectTileLayer(0);
      this._pixiObject.tileAnim = [0, 0];

      runtimeScene
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

    incrementAnimationFrameX(runtimeScene: gdjs.RuntimeScene) {
      this._pixiObject.tileAnim[0] += 1;
    }

    updatePixiTileMap(
      tileMap: TileMapHelper.EditableTileMap,
      textureCache: TileMapHelper.TileTextureCache
    ) {
      TileMapHelper.PixiTileMapHelper.updatePixiTileMap(
        this._pixiObject,
        tileMap,
        textureCache,
        this._object._displayMode,
        this._object._layerIndex
      );
    }

    updatePosition(): void {
      const originalWidth = this._pixiObject.width / this._pixiObject.scale.x;
      const originalHeight = this._pixiObject.height / this._pixiObject.scale.y;
      this._pixiObject.pivot.x = originalWidth / 2;
      this._pixiObject.pivot.y = originalHeight / 2;

      this._pixiObject.position.x = this._object.x + this._pixiObject.width / 2;

      this._pixiObject.position.y =
        this._object.y + this._pixiObject.height / 2;
    }

    updateAngle(): void {
      this._pixiObject.rotation = gdjs.toRad(this._object.angle);
    }

    updateOpacity(): void {
      this._pixiObject.alpha = this._object._opacity / 255;
    }

    setWidth(width: float): void {
      this._pixiObject.width = width / this._pixiObject.scale.x;
      this._pixiObject.pivot.x = width / 2;
      this.updatePosition();
    }

    setHeight(height: float): void {
      this._pixiObject.height = height / this._pixiObject.scale.y;
      this._pixiObject.pivot.y = height / 2;
      this.updatePosition();
    }

    getWidth(): float {
      return this._pixiObject.width;
    }

    getHeight(): float {
      return this._pixiObject.height;
    }
  }
  export const TileMapRuntimeObjectRenderer =
    gdjs.TileMapRuntimeObjectPixiRenderer;
  export type TileMapRuntimeObjectRenderer = gdjs.TileMapRuntimeObjectPixiRenderer;
}
