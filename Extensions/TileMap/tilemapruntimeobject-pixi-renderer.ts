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

    // @ts-ignore - pixi-tilemap types to be added.
    _pixiObject: any;

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
      if (this._pixiObject === undefined) {
        const pixiRenderer = runtimeScene
          .getGame()
          .getRenderer()
          .getPIXIRenderer();

        // @ts-ignore - pixi-tilemap types to be added.
        pixiRenderer.plugins.tilemap = new PIXI.tilemap.TileRenderer();
        // @ts-ignore - pixi-tilemap types to be added.
        this._pixiObject = new PIXI.tilemap.CompositeTilemap();
      }
      this._pixiObject.tileAnim = [0, 0];

      runtimeScene
        .getLayer('')
        .getRenderer()
        .addRendererObject(this._pixiObject, runtimeObject.getZOrder());
      this.updateAngle();
      this.updateOpacity();
      this.updateTileMap();
      this.updatePosition();
    }

    getRendererObject() {
      return this._pixiObject;
    }

    incrementAnimationFrameX(runtimeScene) {
      this._pixiObject.tileAnim[0] += 1;
    }

    _loadTileMapWithTileset(tileMapJsonData, tilesetJsonData) {
      // @ts-ignore - TODO: Add typings for pixi-tilemap-helper.
      const pixiTileMapData = PixiTileMapHelper.loadPixiTileMapData(
        (textureName) =>
          this._runtimeScene
            .getGame()
            .getImageManager()
            .getPIXITexture(textureName),
        tilesetJsonData
          ? { ...tileMapJsonData, tilesets: [tilesetJsonData] }
          : tileMapJsonData,
        this._object._tilemapAtlasImage,
        this._object._tilemapJsonFile,
        this._object._tilesetJsonFile,
        this._object._levelIndex
      );
      if (pixiTileMapData) {
        // @ts-ignore - TODO: Add typings for pixi-tilemap-helper.
        PixiTileMapHelper.updatePixiTileMap(
          this._pixiObject,
          pixiTileMapData,
          this._object._displayMode,
          this._object._layerIndex,
          // @ts-ignore - TODO: Add typings for pako.
          pako
        );
      }
    }

    updateTileMap(): void {
      this._runtimeScene
        .getGame()
        .getJsonManager()
        .loadJson(this._object._tilemapJsonFile, (error, tileMapJsonData) => {
          if (error) {
            logger.error(
              'An error happened while loading a Tilemap JSON data:',
              error
            );
            return;
          }
          if (this._object._tilesetJsonFile) {
            this._runtimeScene
              .getGame()
              .getJsonManager()
              .loadJson(
                this._object._tilesetJsonFile,
                (error, tilesetJsonData) => {
                  if (error) {
                    logger.error(
                      'An error happened while loading Tileset JSON data:',
                      error
                    );
                    return;
                  }
                  this._loadTileMapWithTileset(
                    tileMapJsonData,
                    tilesetJsonData
                  );
                }
              );
          } else {
            this._loadTileMapWithTileset(tileMapJsonData, null);
          }
        });
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

    setWidth(width): void {
      this._pixiObject.width = width / this._pixiObject.scale.x;
      this._pixiObject.pivot.x = width / 2;
      this.updatePosition();
    }

    setHeight(height): void {
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
  export type TileMapRuntimeObjectRenderer =
    gdjs.TileMapRuntimeObjectPixiRenderer;
}
