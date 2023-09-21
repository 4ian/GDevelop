declare namespace PIXI.filters {
  export interface ZoomBlurFilterOptions {
    strength?: number;
    center?: PIXI.Point | [number, number];
    innerRadius?: number;
    radius?: number;
    maxKernelSize?: number;
  }
  export class ZoomBlurFilter extends PIXI.Filter {
    constructor(options?: ZoomBlurFilterOptions);
    constructor(
      strength?: number,
      center?: PIXI.Point | [number, number],
      innerRadius?: number,
      radius?: number
    );
    strength: number;
    center: PIXI.Point | [number, number];
    innerRadius: number;
    radius: number;
  }
}

declare module '@pixi/filter-zoom-blur' {
  export import ZoomBlurFilterOptions = PIXI.filters.ZoomBlurFilterOptions;
  export import ZoomBlurFilter = PIXI.filters.ZoomBlurFilter;
}
