declare namespace PIXI.filters {
  import PIXI = GlobalPIXIModule.PIXI;
  class CrossHatchFilter extends PIXI.Filter {
    constructor();
  }
}

declare module '@pixi/filter-cross-hatch' {
  export import CrossHatchFilter = PIXI.filters.CrossHatchFilter;
}
