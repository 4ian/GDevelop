// https://github.com/pixijs/tilemap

import {
    CanvasTileRenderer,
    CompositeRectTileLayer,
    GraphicsLayer,
    IMultiTextureOptions,
    MultiTextureResource,
    RectTileGeom,
    RectTileLayer,
    RectTileShader,
    TileRenderer,
    ZLayer,
  } from './pixi-tilemap';
  
declare module 'pixi.js' {
  export namespace tilemap {
      export { CanvasTileRenderer };
      export { CompositeRectTileLayer };
      export { GraphicsLayer };
      export { IMultiTextureOptions };
      export { MultiTextureResource };
      export { RectTileGeom };
      export { RectTileLayer };
      export { RectTileShader };
      export { TileRenderer };
      export { ZLayer };
  }
}