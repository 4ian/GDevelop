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

    private _pixiObject: PIXI.tilemap.CompositeTilemap;

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

      const pixiRenderer = runtimeScene
        .getGame()
        .getRenderer()
        .getPIXIRenderer();

      // @ts-ignore - pixi-tilemap types to be added.
      pixiRenderer.plugins.tilemap =
        pixiRenderer.plugins.tilemap || new PIXI.tilemap.TileRenderer();

      // Load (or reset)
      this._pixiObject = new PIXI.tilemap.CompositeTilemap();
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
  }
  export const TileMapRuntimeObjectRenderer =
    gdjs.TileMapRuntimeObjectPixiRenderer;
  export type TileMapRuntimeObjectRenderer = gdjs.TileMapRuntimeObjectPixiRenderer;
}
