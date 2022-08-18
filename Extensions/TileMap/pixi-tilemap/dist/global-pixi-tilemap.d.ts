import {
  CanvasTileRenderer,
  CompositeTilemap,
  Tilemap,
  TilemapGeometry,
  TilemapShader,
  TileRenderer,
} from './pixi-tilemap';

declare global {
  namespace PIXI {
    export namespace tilemap {
      export { CanvasTileRenderer };
      export { CompositeTilemap };
      export { Tilemap };
      export { TilemapGeometry };
      export { TilemapShader };
      export { TileRenderer };
    }
  }
}
