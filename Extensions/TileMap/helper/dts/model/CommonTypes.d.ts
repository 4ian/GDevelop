export declare type integer = number;
export declare type float = number;
export type FloatPoint = [float, float];
export type PolygonVertices = FloatPoint[];
export type EditableTileMapLayerAsJsObject = {
  id: number;
  alpha: number;
  tiles: number[][];
};
export type EditableTileMapAsJsObject = {
  tileWidth: number;
  tileHeight: number;
  dimX: number;
  dimY: number;
  layers: EditableTileMapLayerAsJsObject[];
};
//# sourceMappingURL=CommonTypes.d.ts.map
