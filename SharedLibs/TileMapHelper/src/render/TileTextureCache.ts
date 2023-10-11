import { integer } from "../model/CommonTypes";

/**
 * A cache to access the tile images.
 *
 * It's created by {@link PixiTileMapHelper.parseAtlas}
 * and used by {@link PixiTileMapHelper.updatePixiTileMap}.
 */
export class TileTextureCache {
  private readonly _levelBackgroundTextures: Map<string, PIXI.Texture>;
  private readonly _textures: Map<integer, PIXI.Texture>;

  constructor() {
    this._levelBackgroundTextures = new Map();
    this._textures = new Map();
  }

  setTexture(tileId: integer, texture: PIXI.Texture): void {
    this._textures.set(tileId, texture);
  }

  /**
   * Return the texture to use for the tile with the specified id.
   *
   * @param tileId The tile identifier
   * @returns The texture for the given tile identifier.
   */
  getTexture(tileId: integer): PIXI.Texture | undefined {
    return this._textures.get(tileId);
  }

  getLevelBackgroundTexture(name: string): PIXI.Texture | undefined {
    return this._levelBackgroundTextures.get(name);
  }

  setLevelBackgroundTexture(name: string, texture: PIXI.Texture): void {
    this._levelBackgroundTextures.set(name, texture);
  }
}
