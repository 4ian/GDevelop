namespace gdjs {
  export namespace TileMap {
    import PIXI = GlobalPIXIModule.PIXI;

    /**
     * An holder to share tile maps across the 2 extension objects.
     *
     * Every instance with the same files path in properties will
     * share the same {@link EditableTileMap} and {@link TileTextureCache}.
     *
     * @see {@link TileMapRuntimeManager}
     */
    export class TileMapManager {
      private _tileMapCache: gdjs.TileMap.ResourceCache<
        gdjs.TileMap.EditableTileMap
      >;
      private _textureCacheCaches: gdjs.TileMap.ResourceCache<
        gdjs.TileMap.TileTextureCache
      >;

      /**
       *
       */
      constructor() {
        this._tileMapCache = new gdjs.TileMap.ResourceCache<
          gdjs.TileMap.EditableTileMap
        >();
        this._textureCacheCaches = new gdjs.TileMap.ResourceCache<
          gdjs.TileMap.TileTextureCache
        >();
      }

      /**
       * @param instanceHolder Where to set the manager instance.
       * @returns The shared manager.
       */
      static getManager(instanceHolder: Object) {
        // @ts-ignore
        if (!instanceHolder.tileMapCollisionMaskManager) {
          //Create the shared manager if necessary.
          // @ts-ignore
          instanceHolder.tileMapCollisionMaskManager = new TileMapManager();
        }
        // @ts-ignore
        return instanceHolder.tileMapCollisionMaskManager;
      }

      /**
       * @param loadTiledMap The method that loads the Tiled JSON file in memory.
       * @param tilemapJsonFile
       * @param tilesetJsonFile
       * @param pako The zlib library.
       * @param callback
       */
      getOrLoadTileMap(
        loadTiledMap: (
          tilemapJsonFile: string,
          tilesetJsonFile: string,
          callback: (tiledMap: gdjs.TileMap.TiledMap | null) => void
        ) => void,
        tilemapJsonFile: string,
        tilesetJsonFile: string,
        pako: any,
        callback: (tileMap: gdjs.TileMap.EditableTileMap | null) => void
      ): void {
        const key = tilemapJsonFile + '|' + tilesetJsonFile;

        this._tileMapCache.getOrLoad(
          key,
          (callback) => {
            loadTiledMap(
              tilemapJsonFile,
              tilesetJsonFile,
              (tiledMap: gdjs.TileMap.TiledMap | null) => {
                if (!tiledMap) {
                  callback(null);
                  return;
                }

                const collisionTileMap = gdjs.TileMap.TiledTileMapLoader.load(
                  pako,
                  tiledMap
                );
                callback(collisionTileMap);
              }
            );
          },
          callback
        );
      }

      /**
       * @param loadTiledMap The method that loads the Tiled JSON file in memory.
       * @param getTexture The method that loads the atlas image file in memory.
       * @param atlasImageResourceName
       * @param tilemapJsonFile
       * @param tilesetJsonFile
       * @param callback
       */
      getOrLoadTextureCache(
        loadTiledMap: (
          tilemapJsonFile: string,
          tilesetJsonFile: string,
          callback: (tiledMap: gdjs.TileMap.TiledMap | null) => void
        ) => void,
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
            loadTiledMap(
              tilemapJsonFile,
              tilesetJsonFile,
              (tiledMap: gdjs.TileMap.TiledMap | null) => {
                if (!tiledMap) {
                  // loadTiledMap already log errors.
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
    }
  }
}
