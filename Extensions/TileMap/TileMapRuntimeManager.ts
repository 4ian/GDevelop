/// <reference path="helper/TileMapHelper.d.ts" />
namespace gdjs {
  export interface RuntimeInstanceContainer {
    tileMapCollisionMaskManager: gdjs.TileMap.TileMapRuntimeManager;
  }
  export namespace TileMap {
    const logger = new gdjs.Logger('Tilemap object');

    /**
     * A holder to share tile maps across the 2 extension objects.
     *
     * Every instance with the same files path in properties will
     * share the same {@link EditableTileMap} and {@link TileTextureCache}.
     *
     * To use a tile map with collisions, a user can create 4 objects:
     * - one for the the rendering
     * - one for the solid platforms
     * - one for the jumpthrus
     * - one for the ladders
     *
     * To avoid to have 4 copies of the same tile map in memory, this manager
     * puts the tile map in cache and avoid unnecessary parsing.
     *
     * @see {@link TileMapManager}
     */
    export class TileMapRuntimeManager {
      private _instanceContainer: gdjs.RuntimeInstanceContainer;
      /**
       * Delegate that actually manage the caches without anything specific to
       * GDJS.
       * It allows to factorize code with the IDE.
       */
      private _manager: TileMapHelper.TileMapManager;
      /**
       * @param instanceContainer The instance container.
       */
      private constructor(instanceContainer: gdjs.RuntimeInstanceContainer) {
        this._instanceContainer = instanceContainer;
        this._manager = new TileMapHelper.TileMapManager();
      }

      /**
       * @param instanceContainer Where to set the manager instance.
       * @returns The shared manager.
       */
      static getManager(
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): TileMapRuntimeManager {
        if (!instanceContainer.tileMapCollisionMaskManager) {
          // Create the shared manager if necessary.
          instanceContainer.tileMapCollisionMaskManager = new TileMapRuntimeManager(
            instanceContainer
          );
        }
        return instanceContainer.tileMapCollisionMaskManager;
      }

      /**
       * @param tileMapJsonResourceName The resource name of the tile map.
       * @param tileSetJsonResourceName The resource name of the tile set.
       * @param levelIndex The level of the tile map.
       * @param callback A function called when the tile map is parsed.
       */
      getOrLoadTileMap(
        tileMapJsonResourceName: string,
        tileSetJsonResourceName: string,
        levelIndex: number,
        callback: (
          tileMapFileContent: TileMapHelper.EditableTileMap | null
        ) => void
      ): void {
        this._manager.getOrLoadTileMap(
          this._loadTileMap.bind(this),
          tileMapJsonResourceName,
          tileSetJsonResourceName,
          levelIndex,
          pako,
          callback
        );
      }

      /**
       * @param getTexture The method that loads the atlas image file in memory.
       * @param atlasImageResourceName The resource name of the atlas image.
       * @param tileMapJsonResourceName The resource name of the tile map.
       * @param tileSetJsonResourceName The resource name of the tile set.
       * @param levelIndex The level of the tile map.
       * @param callback A function called when the tiles textures are split.
       */
      getOrLoadTextureCache(
        getTexture: (textureName: string) => PIXI.BaseTexture<PIXI.Resource>,
        atlasImageResourceName: string,
        tileMapJsonResourceName: string,
        tileSetJsonResourceName: string,
        levelIndex: number,
        callback: (textureCache: TileMapHelper.TileTextureCache | null) => void
      ): void {
        this._manager.getOrLoadTextureCache(
          this._loadTileMap.bind(this),
          getTexture,
          atlasImageResourceName,
          tileMapJsonResourceName,
          tileSetJsonResourceName,
          levelIndex,
          callback
        );
      }

      /**
       * Parse both JSON and set the content of the tile set in the right
       * attribute in the tile map to merge both parsed data.
       */
      private _loadTileMap(
        tileMapJsonResourceName: string,
        tileSetJsonResourceName: string,
        callback: (
          tileMapFileContent: TileMapHelper.TileMapFileContent | null
        ) => void
      ): void {
        this._instanceContainer
          .getGame()
          .getJsonManager()
          .loadJson(tileMapJsonResourceName, (error, tileMapJsonData) => {
            if (error) {
              logger.error(
                'An error happened while loading a Tilemap JSON data:',
                error
              );
              callback(null);
              return;
            }
            const tileMapFileContent = TileMapHelper.TileMapManager.identify(
              tileMapJsonData
            );
            if (!tileMapFileContent) {
              callback(null);
              return;
            }
            if (
              tileMapFileContent.kind === 'tiled' &&
              tileSetJsonResourceName
            ) {
              this._instanceContainer
                .getGame()
                .getJsonManager()
                .loadJson(tileSetJsonResourceName, (error, tileSetJsonData) => {
                  if (error) {
                    logger.error(
                      'An error happened while loading Tileset JSON data:',
                      error
                    );
                    callback(null);
                    return;
                  }
                  const tiledMap = tileMapFileContent.data;
                  const tileSet = tileSetJsonData as TileMapHelper.TiledTileset;
                  tileSet.firstgid = tiledMap.tilesets[0].firstgid;
                  tiledMap.tilesets = [tileSet];
                  callback(tileMapFileContent);
                });
            } else {
              callback(tileMapFileContent);
            }
          });
      }
    }
  }
}
