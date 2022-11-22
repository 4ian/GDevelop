import { ResourceCache } from "./ResourceCache";
import { EditableTileMap } from "../model/Model";
import { TileTextureCache } from "./TextureCache";
import { PixiTileMapHelper } from "./PixiHelper";

import PIXI = GlobalPIXIModule.PIXI;
import { TileMap } from "../datatypes/Format";
import { TileMapLoader } from "../datatypes/Loader";

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
   * @returns The data ecnlosed with its detected kind.
   */
  static identify(data: any): TileMap | null {
    if (data.tiledversion) {
      console.info(
        "Detected the json file was created in Tiled"
      );
      return {
        kind: "tiled",
        data,
      };
    }

    if (data.__header__ && data.__header__.app === "LDtk") {
      console.info(
        "Detected the json/ldtk file was created in LDtk"
      );
      return {
        kind: "ldtk",
        data,
      };
    }

    console.warn(
      "The loaded Tile Map data does not contain a 'tiledversion' or '__header__' key. Are you sure this file has been exported from Tiled (mapeditor.org) or LDtk (ldtk.io)?"
    );
    console.log("identify: ", data);

    return null;
  }

  /**
   * @param loadTileMap The method that loads the Tiled JSON file in memory.
   * @param tileMapJsonResourceName The resource name of the tile map.
   * @param tileSetJsonResourceName The resource name of the tile set.
   * @param pako The zlib library.
   * @param callback A function called when the tile map is parsed.
   */
  getOrLoadTileMap(
    loadTileMap: (
      tileMapJsonResourceName: string,
      tileSetJsonResourceName: string,
      callback: (tileMap: TileMap | null) => void
    ) => void,
    tileMapJsonResourceName: string,
    tileSetJsonResourceName: string,
    pako: any,
    callback: (tileMap: EditableTileMap | null) => void
  ): void {
    const key = tileMapJsonResourceName + "|" + tileSetJsonResourceName;

    this._tileMapCache.getOrLoad(
      key,
      (callback) => {
        loadTileMap(
          tileMapJsonResourceName,
          tileSetJsonResourceName,
          (tileMap: TileMap | null) => {
            if (!tileMap) {
              callback(null);
              return;
            }

            const collisionTileMap = TileMapLoader.load(pako, tileMap);
            callback(collisionTileMap);
          }
        );
      },
      callback
    );
  }

  /**
   * @param loadTileMap The method that loads the Tiled JSON file in memory.
   * @param getTexture The method that loads the atlas image file in memory.
   * @param atlasImageResourceName The resource name of the atlas image.
   * @param tileMapJsonResourceName The resource name of the tile map.
   * @param tileSetJsonResourceName The resource name of the tile set.
   * @param callback A function called when the tiles textures are split.
   */
  getOrLoadTextureCache(
    loadTileMap: (
      tileMapJsonResourceName: string,
      tileSetJsonResourceName: string,
      callback: (tileMap: TileMap | null) => void
    ) => void,
    getTexture: (textureName: string) => PIXI.BaseTexture<PIXI.Resource>,
    atlasImageResourceName: string,
    tileMapJsonResourceName: string,
    tileSetJsonResourceName: string,
    callback: (textureCache: TileTextureCache | null) => void
  ): void {
    const key =
      tileMapJsonResourceName +
      "|" +
      tileSetJsonResourceName +
      "|" +
      atlasImageResourceName;

    this._textureCacheCaches.getOrLoad(
      key,
      (callback) => {
        loadTileMap(
          tileMapJsonResourceName,
          tileSetJsonResourceName,
          (tileMap: TileMap | null) => {
            if (!tileMap) {
              // loadTileMap already log errors.
              callback(null);
              return;
            }

            const atlasTexture = atlasImageResourceName
              ? getTexture(atlasImageResourceName)
              : null;
            const textureCache = PixiTileMapHelper.parseAtlas(
              tileMap,
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
