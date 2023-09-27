declare namespace PIXI.filters {
  export class TwistFilter extends PIXI.Filter {
    constructor(radius?: number, angle?: number, padding?: number);
    angle: number;
    offset: PIXI.Point;
    radius: number;
  }
}

declare module '@pixi/filter-twist' {
  export import TwistFilter = PIXI.filters.TwistFilter;
}
