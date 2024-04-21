import { LDtkTileMap } from '../load/ldtk/LDtkFormat';
import { TiledTileMap } from '../load/tiled/TiledFormat';
export declare type TileMap =
  | {
      kind: 'tiled';
      data: TiledTileMap;
    }
  | {
      kind: 'ldtk';
      data: LDtkTileMap;
    };
//# sourceMappingURL=index.d.ts.map
