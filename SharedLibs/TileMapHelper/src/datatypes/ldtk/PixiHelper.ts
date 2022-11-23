import { TileTextureCache } from "../../render/TextureCache";
import { LDtkTileMap, LDtkTilesetDef } from "./Format";
import { getLDtkTileId } from "./LoaderHelper";
import PIXI = GlobalPIXIModule.PIXI;

type Texture = PIXI.BaseTexture<PIXI.Resource>;
type TextureLoader = (textureName: string) => PIXI.BaseTexture<PIXI.Resource>

function getAtlasTexture(atlasTextures: Record<number, Texture | null>, tilesetCache: Record<number, LDtkTilesetDef>, getTexture: TextureLoader, tilesetId: number): Texture | null {
  if(atlasTextures[tilesetId]) {
    return atlasTextures[tilesetId];
  }
  
  let texture = null;
  
  const tileset = tilesetCache[tilesetId];
  if(tileset?.relPath) {
    texture = getTexture(tileset.relPath);
    
    // @ts-ignore
    if(texture.baseTexture?.cacheId === "res/error48.png") {
      console.error(
        `The atlas texture "${tileset.relPath}" can't be loaded`
      );
      
      texture = null;
    }
  }
  else {
    console.error(
      `The tileset "${tileset.identifier}" doesn't seems to contain an atlas texture`
    );
  }
  
  atlasTextures[tilesetId] = texture;
 
  return texture; 
}

export namespace PixiLDtkHelper {
  /**
   * Split an atlas image into Pixi textures.
   *
   * @param tileMap A tile map exported from Tiled.
   * @param atlasTexture The texture containing the whole tile set.
   * @param getTexture A getter to load a texture. Used if atlasTexture is not specified.
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
    for(const tileset of tileMap.defs.tilesets) {
      tilesetCache[tileset.uid] = tileset;
    }
    
    const textureCache = new TileTextureCache();
    const worldTileCache: Record<number, boolean> = {};
    const atlasTextures: Record<number, Texture | null> = {};
    
    for(let iLayer = level.layerInstances.length - 1; iLayer >= 0; --iLayer) {
      const layer = level.layerInstances[iLayer];
      if(layer.__type === "Entities") {
        continue;
      }
      
      const tilesetId = layer.__tilesetDefUid;
      if(typeof tilesetId !== "number") {
        continue;
      }
      
      const tileset = tilesetCache[tilesetId];
      
      const atlasTexture = getAtlasTexture(atlasTextures, tilesetCache, getTexture, tilesetId);
      if(!atlasTexture) {
        continue;
      }
      
      const setTileCache: Record<number, boolean> = {};
      const gridSize = tileset.tileGridSize;
      
      for(const tile of [...layer.autoLayerTiles, ...layer.gridTiles]) {
        if(setTileCache[tile.t]) {
          continue;
        }
        
        const tileId = getLDtkTileId(tilesetId, tile.t);
        if(worldTileCache[tileId]) {
          setTileCache[tile.t] = true;
          continue;
        }
        
        try {
          const [x, y] = tile.src;
          const rect = new PIXI.Rectangle(x, y, gridSize, gridSize);

          const texture = new PIXI.Texture(atlasTexture, rect);

          textureCache.setTexture(tileId, texture);
        } catch (error) {
          console.error(
            'An error occurred while creating a PIXI.Texture to be used in a TileMap:',
            error
          );
        }
        
        setTileCache[tile.t] = true;
        worldTileCache[tileId] = true;
      }
    }
    
    return textureCache;
  }
}