declare namespace PIXI.filters {
  export class GlowFilter extends PIXI.Filter {
    constructor(options?: GlowFilterOptions);
    color: number;
    innerStrength: number;
    outerStrength: number;
    knockout: boolean;
  }
  export interface GlowFilterOptions {
    color?: number;
    distance?: number;
    innerStrength?: number;
    outerStrength?: number;
    quality?: number;
    knockout?: boolean;
  }
}

declare module '@pixi/filter-glow' {
  export import GlowFilter = PIXI.filters.GlowFilter;
  export import GlowFilterOptions = PIXI.filters.GlowFilterOptions;
}
