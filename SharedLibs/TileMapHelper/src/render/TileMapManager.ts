import { ResourceCache } from "./ResourceCache";
import { EditableTileMap } from "../model/TileMapModel";
import { TileTextureCache } from "./TileTextureCache";
import { PixiTileMapHelper } from "./TileMapPixiHelper";
import { TileMapLoader } from "../load/TileMapLoader";
import { TileMapFileContent } from "../load/TileMapFileContent";
import { EditableTileMapAsJsObject } from "../model/CommonTypes";

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
   * @param data JSON data.
   * @returns The data enclosed with its detected kind.
   */
  static identify(data: any): TileMapFileContent | null {
    if (data.tiledversion) {
      console.info("Detected the json file was created in Tiled");
      return {
        kind: "tiled",
        data,
      };
    }

    if (data.__header__ && data.__header__.app === "LDtk") {
      console.info("Detected the json/ldtk file was created in LDtk");
      return {
        kind: "ldtk",
        data,
      };
    }

    console.warn(
      "The loaded Tile Map data does not contain a 'tiledversion' or '__header__' key. Are you sure this file has been exported from Tiled (mapeditor.org) or LDtk (ldtk.io)?"
    );

    return null;
  }

  /**
   * @param loadTileMap The method that loads the Tiled JSON file in memory.
   * @param tileMapJsonResourceName The resource name of the tile map.
   * @param tileSetJsonResourceName The resource name of the tile set.
   * @param levelIndex The level of the tile map to load from.
   * @param pako The zlib library.
   * @param callback A function called when the tile map is parsed.
   */
  getOrLoadTileMap(
    loadTileMap: (
      tileMapJsonResourceName: string,
      tileSetJsonResourceName: string,
      callback: (tileMapFileContent: TileMapFileContent | null) => void
    ) => void,
    tileMapJsonResourceName: string,
    tileSetJsonResourceName: string,
    levelIndex: number,
    pako: any,
    callback: (tileMap: EditableTileMap | null) => void
  ): void {
    const key =
      tileMapJsonResourceName +
      "|" +
      tileSetJsonResourceName +
      "|" +
      levelIndex;

    this._tileMapCache.getOrLoad(
      key,
      (callback) => {
        loadTileMap(
          tileMapJsonResourceName,
          tileSetJsonResourceName,
          (tileMapFileContent: TileMapFileContent | null) => {
            if (!tileMapFileContent) {
              callback(null);
              return;
            }

            const editableTileMap = TileMapLoader.load(
              tileMapFileContent,
              levelIndex,
              pako
            );
            callback(editableTileMap);
          }
        );
      },
      callback
    );
  }

  getOrLoadSimpleTileMap(
    tileMapAsJsObject: EditableTileMapAsJsObject,
    objectName: string,
    tileSize: number,
    tileSetColumnCount: number,
    tileSetRowCount: number,
    // Logic using callback has been set up to mimic what has been done for other
    // loading methods. But it could be refactored to directly return the tile map.
    callback: (tileMap: EditableTileMap) => void
  ): void {
    // TODO: Is it useful to cache the tilemap since it belongs to an instance?
    // const key = `${objectName}|${tileSize}|${tileSetColumnCount}|${tileSetRowCount}`;

    const editableTileMap = EditableTileMap.from(tileMapAsJsObject, {
      tileSize,
      tileSetColumnCount,
      tileSetRowCount,
    });
    callback(editableTileMap);
  }

  /**
   * @param loadTileMap The method that loads the Tiled JSON file in memory.
   * @param getTexture The method that loads the atlas image file in memory.
   * @param atlasImageResourceName The resource name of the atlas image.
   * @param tileMapJsonResourceName The resource name of the tile map.
   * @param tileSetJsonResourceName The resource name of the tile set.
   * @param levelIndex The level of the tile map to load from.
   * @param callback A function called when the tiles textures are split.
   */
  getOrLoadTextureCache(
    loadTileMap: (
      tileMapJsonResourceName: string,
      tileSetJsonResourceName: string,
      callback: (tileMapFileContent: TileMapFileContent | null) => void
    ) => void,
    getTexture: (textureName: string) => PIXI.BaseTexture<PIXI.Resource>,
    atlasImageResourceName: string,
    tileMapJsonResourceName: string,
    tileSetJsonResourceName: string,
    levelIndex: number,
    callback: (textureCache: TileTextureCache | null) => void
  ): void {
    const key =
      tileMapJsonResourceName +
      "|" +
      tileSetJsonResourceName +
      "|" +
      atlasImageResourceName +
      "|" +
      levelIndex;

    this._textureCacheCaches.getOrLoad(
      key,
      (callback) => {
        loadTileMap(
          tileMapJsonResourceName,
          tileSetJsonResourceName,
          (tileMapFileContent: TileMapFileContent | null) => {
            if (!tileMapFileContent) {
              // loadTileMap already log errors.
              callback(null);
              return;
            }

            const atlasTexture = atlasImageResourceName
              ? getTexture(atlasImageResourceName)
              : null;
            const textureCache = PixiTileMapHelper.parseAtlas(
              tileMapFileContent,
              levelIndex,
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

  /**
   * @param getTexture The method that loads the atlas image file in memory.
   * @param atlasImageResourceName The resource name of the atlas image.
   * @param tileSize
   * @param columnCount
   * @param rowCount
   * @param callback A function called when the tiles textures are split.
   */
  getOrLoadSimpleTileMapTextureCache(
    getTexture: (textureName: string) => PIXI.BaseTexture<PIXI.Resource>,
    atlasImageResourceName: string,
    tileSize: number,
    columnCount: number,
    rowCount: number,
    callback: (textureCache: TileTextureCache | null) => void
  ): void {
    const key = `${atlasImageResourceName}|${tileSize}|${columnCount}|${rowCount}`;

    this._textureCacheCaches.getOrLoad(
      key,
      (textureCacheLoadingCallback) => {
        if (!atlasImageResourceName) {
          textureCacheLoadingCallback(null);
          return;
        }

        const atlasTexture = getTexture(atlasImageResourceName);
        const textureCache = PixiTileMapHelper.parseSimpleTileMapAtlas(
          atlasTexture,
          columnCount,
          rowCount,
          tileSize
        );
        textureCacheLoadingCallback(textureCache);
      },
      callback
    );
  }

  clearCaches(): void {
    this._tileMapCache = new ResourceCache<EditableTileMap>();
    this._textureCacheCaches = new ResourceCache<TileTextureCache>();
  }
}
