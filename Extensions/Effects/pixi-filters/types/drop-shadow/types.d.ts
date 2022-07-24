declare namespace PIXI.filters {
  export class DropShadowFilter extends PIXI.Filter {
    constructor(options?: DropShadowFilterOptions);
    alpha: number;
    blur: number;
    color: number;
    distance: number;
    kernels: number[];
    pixelSize: number | number[] | PIXI.Point;
    quality: number;
    rotation: number;
    shadowOnly: boolean;
  }
  export interface DropShadowFilterOptions {
    alpha?: number;
    blur?: number;
    color?: number;
    distance?: number;
    kernels?: number[];
    pixelSize?: number | number[] | PIXI.Point;
    quality?: number;
    resolution?: number;
    rotation?: number;
    shadowOnly?: boolean;
  }
}

declare module '@pixi/filter-drop-shadow' {
  export import DropShadowFilter = PIXI.filters.DropShadowFilter;
  export import DropShadowFilterOptions = PIXI.filters.DropShadowFilterOptions;
}
