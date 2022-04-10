/// <reference path="helper/TileMapHelper.d.ts" />
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
      private _manager: TileMapHelper.TileMapManager;
      /**
       * @param object The object
       */
      private constructor(runtimeScene: gdjs.RuntimeScene) {
        this._runtimeScene = runtimeScene;
        this._manager = new TileMapHelper.TileMapManager();
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
        callback: (tileMap: TileMapHelper.EditableTileMap | null) => void
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
        callback: (textureCache: TileMapHelper.TileTextureCache | null) => void
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
        callback: (tiledMap: TileMapHelper.TiledMap | null) => void
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
            const tiledMap = tileMapJsonData as TileMapHelper.TiledMap;
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
                  const tileSet = tilesetJsonData as TileMapHelper.TiledTileset;
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
