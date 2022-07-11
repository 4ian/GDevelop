declare namespace PIXI.filters {
  export class DotFilter extends PIXI.Filter {
    constructor(scale?: number, angle?: number);
    angle: number;
    scale: number;
  }
}

declare module '@pixi/filter-dot' {
  export import DotFilter = PIXI.filters.DotFilter;
}
