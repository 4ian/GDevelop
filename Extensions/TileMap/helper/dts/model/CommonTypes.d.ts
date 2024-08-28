export declare type integer = number;
export declare type float = number;
export declare type FloatPoint = [float, float];
export declare type PolygonVertices = FloatPoint[];
export declare type EditableTileMapLayerAsJsObject = {
  id: number;
  alpha: number;
  tiles: number[][];
};
export declare type EditableTileMapAsJsObject = {
  tileWidth: number;
  tileHeight: number;
  dimX: number;
  dimY: number;
  layers: EditableTileMapLayerAsJsObject[];
};
//# sourceMappingURL=CommonTypes.d.ts.map
