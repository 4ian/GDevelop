import { LDtkTileMap } from "./LDtkFormat";
import { TiledTileMap } from "./TiledFormat";

export type TileMap =
  | {
      kind: "tiled";
      data: TiledTileMap;
    }
  | {
      kind: "ldtk";
      data: LDtkTileMap;
    };
