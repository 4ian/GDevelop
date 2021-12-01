namespace gdjs {
  export namespace TileMap {
    import PIXI = GlobalPIXIModule.PIXI;

    const logger = new gdjs.Logger('Tilemap object');

    /**
     * An holder to share tile maps across the 2 extension objects.
     *
     * Every instance with the same files path in properties will
     * share the same {@link EditableTileMap} and {@link TileTextureCache}.
     *
     * @see {@link TileMapRuntimeManager}
     */
    export class TileMapRuntimeManager {
      private _runtimeScene: gdjs.RuntimeScene;
      /**
       * Delegate
       */
      private _manager: gdjs.TileMap.TileMapManager;
      /**
       * @param object The object
       */
      private constructor(runtimeScene: gdjs.RuntimeScene) {
        this._runtimeScene = runtimeScene;
        this._manager = new gdjs.TileMap.TileMapManager();
      }

      /**
       * @param instanceHolder Where to set the manager instance.
       * @returns The shared manager.
       */
      static getManager(runtimeScene: gdjs.RuntimeScene) {
        // @ts-ignore
        if (!runtimeScene.tileMapCollisionMaskManager) {
          //Create the shared manager if necessary.
          // @ts-ignore
          runtimeScene.tileMapCollisionMaskManager = new TileMapRuntimeManager(
            runtimeScene
          );
        }
        // @ts-ignore
        return runtimeScene.tileMapCollisionMaskManager;
      }

      /**
       * @param tilemapJsonFile
       * @param tilesetJsonFile
       * @param callback
       */
      getOrLoadTileMap(
        tilemapJsonFile: string,
        tilesetJsonFile: string,
        callback: (tileMap: gdjs.TileMap.EditableTileMap | null) => void
      ): void {
        this._manager.getOrLoadTileMap(
          this._loadTiledMap.bind(this),
          tilemapJsonFile,
          tilesetJsonFile,
          pako,
          callback
        );
      }

      /**
       * @param getTexture The method that loads the atlas image file in memory.
       * @param atlasImageResourceName
       * @param tilemapJsonFile
       * @param tilesetJsonFile
       * @param callback
       */
      getOrLoadTextureCache(
        getTexture: (textureName: string) => PIXI.BaseTexture<PIXI.Resource>,
        atlasImageResourceName: string,
        tilemapJsonFile: string,
        tilesetJsonFile: string,
        callback: (textureCache: gdjs.TileMap.TileTextureCache | null) => void
      ): void {
        this._manager.getOrLoadTextureCache(
          this._loadTiledMap.bind(this),
          getTexture,
          atlasImageResourceName,
          tilemapJsonFile,
          tilesetJsonFile,
          callback
        );
      }

      _loadTiledMap(
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
