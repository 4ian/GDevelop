declare namespace PIXI.filters {
  export interface BulgePinchFilterOptions {
    center?: PIXI.Point | [number, number];
    radius?: number;
    strength?: number;
  }
  export class BulgePinchFilter extends PIXI.Filter {
    constructor(options?: BulgePinchFilterOptions);
    constructor(
      center?: PIXI.Point | [number, number],
      radius?: number,
      strength?: number
    );
    center: PIXI.Point;
    radius: number;
    strength: number;
  }
}

declare module '@pixi/filter-bulge-pinch' {
  export import BulgePinchFilterOptions = PIXI.filters.BulgePinchFilterOptions;
  export import BulgePinchFilter = PIXI.filters.BulgePinchFilter;
}
