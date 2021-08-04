import * as pixi from 'pixi.js';
declare module 'pixi.js' {
  namespace filters {
    export class AdjustmentFilter extends pixi.Filter {
      constructor(options?: AdjustmentOptions);
      gamma: number;
      contrast: number;
      saturation: number;
      brightness: number;
      red: number;
      green: number;
      blue: number;
      alpha: number;
    }
    export interface AdjustmentOptions {
      gamma?: number;
      contrast?: number;
      saturation?: number;
      brightness?: number;
      red?: number;
      green?: number;
      blue?: number;
      alpha?: number;
    }
  }
}

declare module '@pixi/filter-adjustment' {
  export import AdjustmentFilter = PIXI.filters.AdjustmentFilter;
  export import AdjustmentOptions = PIXI.filters.AdjustmentOptions;
}
