declare namespace PIXI.filters {
  export class DropShadowFilter extends PIXI.Filter {
    constructor(options?: DropShadowFilterOptions);
    /** @deprecated */
    rotation: number;
    /** @deprecated */
    distance: number;
    offset: PIXI.Point;
    alpha: number;
    blur: number;
    color: number;
    kernels: number[];
    pixelSize: number | number[] | PIXI.Point;
    quality: number;
    shadowOnly: boolean;
  }
  export interface DropShadowFilterOptions {
    /** @deprecated */
    rotation?: number;
    /** @deprecated */
    distance?: number;
    offset: PIXI.Point;
    alpha?: number;
    blur?: number;
    color?: number;
    kernels?: number[];
    pixelSize?: number | number[] | PIXI.Point;
    quality?: number;
    resolution?: number;
    shadowOnly?: boolean;
  }
}

declare module '@pixi/filter-drop-shadow' {
  export import DropShadowFilter = PIXI.filters.DropShadowFilter;
  export import DropShadowFilterOptions = PIXI.filters.DropShadowFilterOptions;
}
