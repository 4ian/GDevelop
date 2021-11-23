namespace gdjs {
  export namespace TileMap {
    import PIXI = GlobalPIXIModule.PIXI;

    const logger = new gdjs.Logger('Tilemap object');

    export class TileMapManager {
      private _runtimeScene: gdjs.RuntimeScene;

      private _tileMapCache: gdjs.TileMap.ResourceCache<
        gdjs.TileMap.EditableTileMap
      >;
      private _textureCacheCaches: gdjs.TileMap.ResourceCache<
        gdjs.TileMap.TileTextureCache
      >;

      /**
       * @param object The object
       */
      constructor(runtimeScene: gdjs.RuntimeScene) {
        this._runtimeScene = runtimeScene;
        this._tileMapCache = new gdjs.TileMap.ResourceCache<
          gdjs.TileMap.EditableTileMap
        >();
        this._textureCacheCaches = new gdjs.TileMap.ResourceCache<
          gdjs.TileMap.TileTextureCache
        >();
      }

      /**
       * Get the platforms manager of a scene.
       */
      static getManager(runtimeScene: gdjs.RuntimeScene) {
        // @ts-ignore
        if (!runtimeScene.tileMapCollisionMaskManager) {
          //Create the shared manager if necessary.
          // @ts-ignore
          runtimeScene.tileMapCollisionMaskManager = new TileMapManager(
            runtimeScene
          );
        }
        // @ts-ignore
        return runtimeScene.tileMapCollisionMaskManager;
      }

      getOrLoadTileMap(
        tilemapJsonFile: string,
        tilesetJsonFile: string,
        callback: (tileMap: gdjs.TileMap.EditableTileMap | null) => void
      ): void {
        const key = tilemapJsonFile + '|' + tilesetJsonFile;

        this._tileMapCache.getOrLoad(
          key,
          (callback) => {
            this._loadTiledMap(
              tilemapJsonFile,
              tilesetJsonFile,
              (tiledMap: gdjs.TileMap.TiledMap | null) => {
                if (!tiledMap) {
                  callback(null);
                  return;
                }

                const collisionTileMap = gdjs.TileMap.TiledTileMapLoader.load(
                  tiledMap
                );
                callback(collisionTileMap);
              }
            );
          },
          callback
        );
      }

      getOrLoadTextureCache(
        getTexture: (textureName: string) => PIXI.BaseTexture<PIXI.Resource>,
        atlasImageResourceName: string,
        tilemapJsonFile: string,
        tilesetJsonFile: string,
        callback: (textureCache: gdjs.TileMap.TileTextureCache | null) => void
      ): void {
        const key =
          tilemapJsonFile +
          '|' +
          tilesetJsonFile +
          '|' +
          atlasImageResourceName;

        this._textureCacheCaches.getOrLoad(
          key,
          (callback) => {
            this._loadTiledMap(
              tilemapJsonFile,
              tilesetJsonFile,
              (tiledMap: gdjs.TileMap.TiledMap | null) => {
                if (!tiledMap) {
                  callback(null);
                  return;
                }

                const atlasTexture = atlasImageResourceName
                  ? getTexture(atlasImageResourceName)
                  : null;
                const textureCache = gdjs.TileMap.PixiTileMapHelper.parseAtlas(
                  tiledMap,
                  atlasTexture,
                  getTexture
                );
                callback(textureCache);
              }
            );
          },
          callback
        );
      }

      private _loadTiledMap(
        tilemapJsonFile: string,
        tilesetJsonFile: string,
        callback: (tiledMap: gdjs.TileMap.TiledMap | null) => void
      ) {
        this._runtimeScene
          .getGame()
          .getJsonManager()
          .loadJson(tilemapJsonFile, (error, tileMapJsonData) => {
            if (error) {
              logger.error(
                'An error happened while loading a Tilemap JSON data:',
                error
              );
              callback(null);
              return;
            }
            const tiledMap = tileMapJsonData as gdjs.TileMap.TiledMap;
            if (tilesetJsonFile) {
              this._runtimeScene
                .getGame()
                .getJsonManager()
                .loadJson(tilesetJsonFile, (error, tilesetJsonData) => {
                  if (error) {
                    logger.error(
                      'An error happened while loading Tileset JSON data:',
                      error
                    );
                    callback(null);
                    return;
                  }
                  const tileSet = tilesetJsonData as gdjs.TileMap.TiledTileset;
                  tiledMap.tilesets = [tileSet];
                  callback(tiledMap);
                });
            } else {
              callback(tiledMap);
            }
          });
      }
    }
  }
}
