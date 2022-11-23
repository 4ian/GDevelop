import { LDtkTileMap } from "./LDtk";
import { TiledTileMap } from "./Tiled";

export type TileMap = {
  kind: "tiled",
  data: TiledTileMap,
} | {
  kind: "ldtk",
  data: LDtkTileMap,
};
