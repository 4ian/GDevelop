import { ResourceCache } from "./ResourceCache";
import { TiledMap } from "../tiled/Tiled";
import { TiledTileMapLoader } from "../tiled/TiledTileMapLoader";
import { EditableTileMap } from "../model/TileMapModel";
import { TileTextureCache } from "./TileTextureCache";
import { PixiTileMapHelper } from "./TilemapPixiHelper";

import PIXI = GlobalPIXIModule.PIXI;

/**
 * A holder to share tile maps across the 2 extension objects.
 *
 * Every instance with the same files path in properties will
 * share the same {@link EditableTileMap} and {@link TileTextureCache}.
 *
 * @see {@link TileMapRuntimeManager}
 */
export class TileMapManager {
  private _tileMapCache: ResourceCache<EditableTileMap>;
  private _textureCacheCaches: ResourceCache<TileTextureCache>;

  /**
   *
   */
  constructor() {
    this._tileMapCache = new ResourceCache<EditableTileMap>();
    this._textureCacheCaches = new ResourceCache<TileTextureCache>();
  }

  /**
   * @param instanceHolder Where to set the manager instance.
   * @returns The shared manager.
   */
  static getManager(instanceHolder: Object): TileMapManager {
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
      callback: (tiledMap: TiledMap | null) => void
    ) => void,
    tilemapJsonFile: string,
    tilesetJsonFile: string,
    pako: any,
    callback: (tileMap: EditableTileMap | null) => void
  ): void {
    const key = tilemapJsonFile + "|" + tilesetJsonFile;

    this._tileMapCache.getOrLoad(
      key,
      (callback) => {
        loadTiledMap(
          tilemapJsonFile,
          tilesetJsonFile,
          (tiledMap: TiledMap | null) => {
            if (!tiledMap) {
              callback(null);
              return;
            }

            const collisionTileMap = TiledTileMapLoader.load(pako, tiledMap);
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
      callback: (tiledMap: TiledMap | null) => void
    ) => void,
    getTexture: (textureName: string) => PIXI.BaseTexture<PIXI.Resource>,
    atlasImageResourceName: string,
    tilemapJsonFile: string,
    tilesetJsonFile: string,
    callback: (textureCache: TileTextureCache | null) => void
  ): void {
    const key =
      tilemapJsonFile + "|" + tilesetJsonFile + "|" + atlasImageResourceName;

    this._textureCacheCaches.getOrLoad(
      key,
      (callback) => {
        loadTiledMap(
          tilemapJsonFile,
          tilesetJsonFile,
          (tiledMap: TiledMap | null) => {
            if (!tiledMap) {
              // loadTiledMap already log errors.
              callback(null);
              return;
            }

            const atlasTexture = atlasImageResourceName
              ? getTexture(atlasImageResourceName)
              : null;
            const textureCache = PixiTileMapHelper.parseAtlas(
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
