import { LDtkTileMap } from './LDtkFormat';
import { TiledTileMap } from './TiledFormat';
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
