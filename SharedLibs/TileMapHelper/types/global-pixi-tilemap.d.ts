// https://github.com/pixijs/tilemap

import {
  CanvasTileRenderer,
  CompositeTilemap,
  Tilemap,
  TilemapGeometry,
  TilemapShader,
  TileRenderer,
  settings,
  } from './pixi-tilemap';
  
declare module 'pixi.js' {
  export namespace tilemap {
    export { CanvasTileRenderer };
    export { CompositeTilemap };
    export { Tilemap };
    export { TilemapGeometry };
    export { TilemapShader };
    export { TileRenderer };
    export { settings };
  }
}