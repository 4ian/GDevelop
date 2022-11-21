import { LDtkTileMap } from "./ldtk/Format";
import { TiledTileMap } from "./tiled/Format";
export type TileMap = {
    kind: "tiled";
    data: TiledTileMap;
} | {
    kind: "ldtk";
    data: LDtkTileMap;
};
//# sourceMappingURL=Format.d.ts.map