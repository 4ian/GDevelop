declare namespace PIXI.filters {
  export class BevelFilter extends PIXI.Filter {
    constructor(options?: BevelOptions);
    rotation: number;
    thickness: number;
    lightColor: number;
    lightAlpha: number;
    shadowColor: number;
    shadowAlpha: number;
  }
  export interface BevelOptions {
    rotation: number;
    thickness: number;
    lightColor: number;
    lightAlpha: number;
    shadowColor: number;
    shadowAlpha: number;
  }
}

declare module '@pixi/filter-bevel' {
  export import BevelFilter = PIXI.filters.BevelFilter;
  export import BevelOptions = PIXI.filters.BevelOptions;
}
