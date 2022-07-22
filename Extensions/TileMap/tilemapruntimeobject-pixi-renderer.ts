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
    private _object: any;
    private _runtimeScene: gdjs.RuntimeScene;
    private _tileMap: TileMapHelper.EditableTileMap | null = null;

    private _pixiObject: PIXI.tilemap.CompositeRectTileLayer;

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
      this._tileMap = tileMap;
      TileMapHelper.PixiTileMapHelper.updatePixiTileMap(
        this._pixiObject,
        tileMap,
        textureCache,
        this._object._displayMode,
        this._object._layerIndex
      );
    }

    updatePosition(): void {
      const tileMap = this._tileMap;
      const originalWidth = tileMap ? tileMap.getWidth() : 20;
      const originalHeight = tileMap ? tileMap.getHeight() : 20;

      this._pixiObject.pivot.x = originalWidth / 2;
      this._pixiObject.pivot.y = originalHeight / 2;

      const width = this.getWidth();
      const height = this.getHeight();

      this._pixiObject.position.x = this._object.x + width / 2;
      this._pixiObject.position.y = this._object.y + height / 2;
    }

    updateAngle(): void {
      this._pixiObject.rotation = gdjs.toRad(this._object.angle);
    }

    updateOpacity(): void {
      this._pixiObject.alpha = this._object._opacity / 255;
    }

    setWidth(width: float): void {
      const tileMap = this._tileMap;
      const originalHeight = tileMap ? tileMap.getWidth() : 20;
      this._pixiObject.scale.x = width / originalHeight;
      this._pixiObject.position.x = this._object.x + width / 2;
    }

    setHeight(height: float): void {
      const tileMap = this._tileMap;
      const originalHeight = tileMap ? tileMap.getHeight() : 20;
      this._pixiObject.scale.y = height / originalHeight;
      this._pixiObject.position.y = this._object.y + height / 2;
    }

    getWidth(): float {
      const tileMap = this._tileMap;
      const originalWidth = tileMap ? tileMap.getWidth() : 20;
      return originalWidth * this._pixiObject.scale.x;
    }

    getHeight(): float {
      const tileMap = this._tileMap;
      const originalHeight = tileMap ? tileMap.getHeight() : 20;
      return originalHeight * this._pixiObject.scale.y;
    }
  }
  export const TileMapRuntimeObjectRenderer =
    gdjs.TileMapRuntimeObjectPixiRenderer;
  export type TileMapRuntimeObjectRenderer = gdjs.TileMapRuntimeObjectPixiRenderer;
}
