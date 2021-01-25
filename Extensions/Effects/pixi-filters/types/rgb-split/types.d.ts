declare namespace PIXI.filters {
  export class RGBSplitFilter extends PIXI.Filter {
    constructor(red?: PIXI.Point, green?: PIXI.Point, blue?: PIXI.Point);
    red: PIXI.Point;
    green: PIXI.Point;
    blue: PIXI.Point;
  }
}

declare module '@pixi/filter-rgb-split' {
  export import RGBSplitFilter = PIXI.filters.RGBSplitFilter;
}
