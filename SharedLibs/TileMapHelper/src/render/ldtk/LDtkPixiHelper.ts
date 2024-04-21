import { TileTextureCache } from "../TileTextureCache";
import { LDtkTileMap, LDtkTilesetDef } from "../../load/ldtk/LDtkFormat";
import { getLDtkTileId } from "../../load/ldtk/LDtkTileMapLoaderHelper";

type Texture = PIXI.BaseTexture<PIXI.Resource>;
type TextureLoader = (textureName: string) => PIXI.BaseTexture<PIXI.Resource>;

function getAtlasTexture(
  atlasTextures: Record<number, Texture | null>,
  tilesetCache: Record<number, LDtkTilesetDef>,
  getTexture: TextureLoader,
  tilesetId: number
): Texture | null {
  if (atlasTextures[tilesetId]) {
    return atlasTextures[tilesetId];
  }

  let texture: Texture | null = null;

  const tileset = tilesetCache[tilesetId];
  if (tileset?.relPath) {
    texture = getTexture(tileset.relPath);

    // @ts-ignore
    if (texture.baseTexture?.cacheId === "res/error48.png") {
      console.error(`The atlas texture "${tileset.relPath}" can't be loaded`);

      texture = null;
    }
  } else {
    console.error(
      `The tileset "${tileset.identifier}" doesn't seems to contain an atlas texture`
    );
  }

  atlasTextures[tilesetId] = texture;

  return texture;
}

export namespace LDtkPixiHelper {
  /**
   * Split an atlas image into Pixi textures.
   *
   * @param tileMap A tile map exported from LDtk.
   * @param levelIndex The level of the tile map to load from.
   * @param atlasTexture The texture containing the whole tile set.
   * @param getTexture A getter to load a texture.
   * @returns A textures cache.
   */
  export function parseAtlas(
    tileMap: LDtkTileMap,
    levelIndex: number,
    atlasTexture: Texture | null,
    getTexture: TextureLoader
  ): TileTextureCache | null {
    const level = tileMap.levels[levelIndex > -1 ? levelIndex : 0];
    if (!level || !level.layerInstances) {
      return null;
    }

    const tilesetCache: Record<number, LDtkTilesetDef> = {};
    for (const tileset of tileMap.defs.tilesets) {
      tilesetCache[tileset.uid] = tileset;
    }

    const textureCache = new TileTextureCache();
    // List the tiles that have been loaded to Pixi by all the layers of the level.
    // The keys are a composition (getLDtkTileId) between the tileset's id and the tile's id.
    const levelTileCache: Record<number, boolean> = {};
    const atlasTextures: Record<number, Texture | null> = {};

    for (let iLayer = level.layerInstances.length - 1; iLayer >= 0; --iLayer) {
      const layer = level.layerInstances[iLayer];
      if (layer.__type === "Entities") {
        continue;
      }

      const tilesetId = layer.__tilesetDefUid;
      if (typeof tilesetId !== "number") {
        continue;
      }

      const tileset = tilesetCache[tilesetId];

      const atlasTexture = getAtlasTexture(
        atlasTextures,
        tilesetCache,
        getTexture,
        tilesetId
      );
      if (!atlasTexture) {
        continue;
      }

      // List the tiles that have been loaded to Pixi by the current layer.
      // Since layer can only have tiles from 1 tileset, the keys are only the tile's id.
      const layerTileCache: Record<number, boolean> = {};
      const gridSize = tileset.tileGridSize;

      for (const tile of [...layer.autoLayerTiles, ...layer.gridTiles]) {
        if (layerTileCache[tile.t]) {
          continue;
        }

        const tileId = getLDtkTileId(tilesetId, tile.t);
        if (levelTileCache[tileId]) {
          layerTileCache[tile.t] = true;
          continue;
        }

        try {
          const [x, y] = tile.src;
          const rect = new PIXI.Rectangle(x, y, gridSize, gridSize);

          const texture = new PIXI.Texture(atlasTexture, rect);

          textureCache.setTexture(tileId, texture);
        } catch (error) {
          console.error(
            "An error occurred while creating a PIXI.Texture to be used in a TileMap:",
            error
          );
        }

        layerTileCache[tile.t] = true;
        levelTileCache[tileId] = true;
      }
    }

    if (level.bgRelPath) {
      const atlasTexture = getTexture(level.bgRelPath);
      const rect = new PIXI.Rectangle(0, 0, level.pxWid, level.pxHei);
      const texture = new PIXI.Texture(atlasTexture!, rect);

      textureCache.setLevelBackgroundTexture(level.bgRelPath, texture);
    }

    return textureCache;
  }
}
