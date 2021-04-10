declare namespace PIXI.filters {
  import PIXI = GlobalPIXIModule.PIXI;
  export class DotFilter extends PIXI.Filter {
    constructor(scale?: number, angle?: number);
    angle: number;
    scale: number;
  }
}

declare module '@pixi/filter-dot' {
  export import DotFilter = PIXI.filters.DotFilter;
}
