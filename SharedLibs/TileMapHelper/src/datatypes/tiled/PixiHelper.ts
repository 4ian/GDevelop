import { TileTextureCache } from "../../render/TextureCache";
import { TiledTileMap } from "./Format";
import { getTileIdFromTiledGUI } from "./LoaderHelper";
import PIXI = GlobalPIXIModule.PIXI;

export namespace PixiTiledHelper {
  /**
   * Split an atlas image into Pixi textures.
   *
   * @param tiledMap A tile map exported from Tiled.
   * @param atlasTexture The texture containing the whole tile set.
   * @param getTexture A getter to load a texture. Used if atlasTexture is not specified.
   * @returns A textures cache.
   */
  export function parseAtlas(
    tiledMap: TiledTileMap,
    atlasTexture: PIXI.BaseTexture<PIXI.Resource> | null,
    getTexture: (textureName: string) => PIXI.BaseTexture<PIXI.Resource>
  ): TileTextureCache | null {
    if (!tiledMap.tiledversion) {
      console.warn(
        "The loaded Tiled map does not contain a 'tiledversion' key. Are you sure this file has been exported from Tiled (mapeditor.org)?"
      );

      return null;
    }

    // We only handle tileset embedded in the tilemap. Warn if it's not the case.
    if (!tiledMap.tilesets.length || "source" in tiledMap.tilesets[0]) {
      console.warn(
        "The loaded Tiled map seems not to contain any tileset data (nothing in 'tilesets' key)."
      );
      return null;
    }

    const tiledSet = tiledMap.tilesets[0];
    const {
      tilewidth,
      tileheight,
      tilecount,
      image,
      columns,
      spacing,
      margin,
    } = tiledSet;
    const firstGid = tiledSet.firstgid === undefined ? 1 : tiledSet.firstgid;
    if (!atlasTexture) atlasTexture = getTexture(image);

    // We try to detect what size Tiled is expecting.
    const rows = tilecount / columns;
    const expectedAtlasWidth =
      tilewidth * columns + spacing * (columns - 1) + margin * 2;
    const expectedAtlasHeight =
      tileheight * rows + spacing * (rows - 1) + margin * 2;
    // When users use an atlas images that are not divisible by the tile width,
    // Tiled automatically chooses a number of column that fit in the atlas for
    // a given tile size.
    // So the atlas images can have unused pixels at the right and bottom.
    if (
      (atlasTexture.width !== 1 && atlasTexture.width < expectedAtlasWidth) ||
      atlasTexture.width >= expectedAtlasWidth + spacing + tilewidth ||
      (atlasTexture.height !== 1 &&
        atlasTexture.height < expectedAtlasHeight) ||
      atlasTexture.height >= expectedAtlasHeight + spacing + tileheight
    ) {
      console.error(
        "It seems the atlas file was resized, which is not supported. " +
          `It should be ${expectedAtlasWidth}x${expectedAtlasHeight} px, ` +
          `but it's ${atlasTexture.width}x${atlasTexture.height} px.`
      );
      return null;
    }
    if (
      (atlasTexture.width !== 1 && atlasTexture.width !== expectedAtlasWidth) ||
      (atlasTexture.height !== 1 && atlasTexture.height !== expectedAtlasHeight)
    ) {
      console.warn(
        "It seems the atlas file has unused pixels. " +
          `It should be ${expectedAtlasWidth}x${expectedAtlasHeight} px, ` +
          `but it's ${atlasTexture.width}x${atlasTexture.height} px.`
      );
      return null;
    }

    // Prepare the textures pointing to the base "Atlas" Texture for each tile.
    // Note that this cache can be augmented later with rotated/flipped
    // versions of the tile textures.
    const textureCache = new TileTextureCache();
    for (let tileSetIndex = 0; tileSetIndex < tilecount; tileSetIndex++) {
      const columnMultiplier = Math.floor(tileSetIndex % columns);
      const rowMultiplier = Math.floor(tileSetIndex / columns);
      const x = margin + columnMultiplier * (tilewidth + spacing);
      const y = margin + rowMultiplier * (tileheight + spacing);
      const tileId = getTileIdFromTiledGUI(firstGid + tileSetIndex);

      try {
        const rect = new PIXI.Rectangle(x, y, tilewidth, tileheight);
        const texture = new PIXI.Texture(atlasTexture!, rect);

        textureCache.setTexture(tileId, false, false, false, texture);
      } catch (error) {
        console.error(
          "An error occurred while creating a PIXI.Texture to be used in a TileMap:",
          error
        );
      }
    }

    return textureCache;
  }
}