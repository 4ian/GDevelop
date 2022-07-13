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

declare global {
  namespace PIXI {
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
}
