namespace gdjs {
  export namespace TileMap {
    import PIXI = GlobalPIXIModule.PIXI;

    const logger = new gdjs.Logger('Tilemap object');

    export class TileMapManager {
      private _runtimeScene: gdjs.RuntimeScene;

      private _tileMaps: Map<string, gdjs.TileMap.EditableTileMap>;
      private _textureCaches: Map<string, gdjs.TileMap.TileTextureCache>;

      private _tileMapCallbacks: Map<
        string,
        Array<(tileMap: gdjs.TileMap.EditableTileMap | null) => void>
      >;
      private _textureCachesCallbacks: Map<
        string,
        Array<(textureCache: gdjs.TileMap.TileTextureCache | null) => void>
      >;

      /**
       * @param object The object
       */
      constructor(runtimeScene: gdjs.RuntimeScene) {
        this._runtimeScene = runtimeScene;
        this._tileMaps = new Map<string, gdjs.TileMap.EditableTileMap>();
        this._textureCaches = new Map<string, gdjs.TileMap.TileTextureCache>();
        this._tileMapCallbacks = new Map<
          string,
          Array<(tileMap: gdjs.TileMap.EditableTileMap | null) => void>
        >();
        this._textureCachesCallbacks = new Map<
          string,
          Array<(textureCache: gdjs.TileMap.TileTextureCache | null) => void>
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
        const collisionTileMap = this._tileMaps.get(key);
        if (collisionTileMap) {
          callback(collisionTileMap);
          console.log('already loaded');
          return;
        }
        const callbacks = this._tileMapCallbacks.get(key);
        if (callbacks) {
          callbacks.push(callback);
          return;
        } else {
          this._tileMapCallbacks.set(key, [callback]);
        }
        this._loadTiledMap(
          tilemapJsonFile,
          tilesetJsonFile,
          (tiledMap: gdjs.TileMap.TiledMap | null) => {
            const callbacks = this._tileMapCallbacks.get(key)!;
            if (!tiledMap) {
              this._tileMapCallbacks.delete(key);
              for (const callback of callbacks) {
                callback(null);
              }
              return;
            }

            const collisionTileMap = gdjs.TileMap.TiledTileMapLoader.load(
              tiledMap
            );
            this._tileMaps.set(key, collisionTileMap);
            for (const callback of callbacks) {
              callback(collisionTileMap);
            }
          }
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
        const textureCache = this._textureCaches.get(key);
        if (textureCache) {
          callback(textureCache);
          console.log('already loaded');
          return;
        }
        const callbacks = this._textureCachesCallbacks.get(key);
        if (callbacks) {
          callbacks.push(callback);
          return;
        } else {
          this._textureCachesCallbacks.set(key, [callback]);
        }
        this._loadTiledMap(
          tilemapJsonFile,
          tilesetJsonFile,
          (tiledMap: gdjs.TileMap.TiledMap | null) => {
            const callbacks = this._textureCachesCallbacks.get(key)!;
            if (!tiledMap) {
              for (const callback of callbacks) {
                callback(null);
              }
              this._textureCachesCallbacks.delete(key);
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

            if (textureCache) {
              this._textureCaches.set(key, textureCache);
            }
            for (const callback of callbacks) {
              callback(textureCache);
            }
          }
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
