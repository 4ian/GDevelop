import { integer } from "../types/commons";

import PIXI = GlobalPIXIModule.PIXI;

/**
 * A cache to access the tile images.
 *
 * It's created by {@link PixiTileMapHelper.parseAtlas}
 * and used by {@link PixiTileMapHelper.updatePixiTileMap}.
 */
export class TileTextureCache {
  private readonly _images: Map<string, PIXI.Texture>;
  private readonly _textures: Map<integer, PIXI.Texture>;

  constructor() {
    this._images = new Map();
    this._textures = new Map();
  }

  getImage(name: string): PIXI.Texture | undefined {
    return this._images.get(name);
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

  setImage(name: string, texture: PIXI.Texture): void {
    this._images.set(name, texture);
  }

  setTexture(tileId: integer, texture: PIXI.Texture): void {
    this._textures.set(tileId, texture);
  }
}
