declare namespace PIXI.filters {
  export class OutlineFilter extends PIXI.Filter {
    constructor(thickness?: number, color?: number, quality?: number);
    color: number;
    thickness: number;
    readonly quality: number;
  }
}

declare module '@pixi/filter-outline' {
  export import OutlineFilter = PIXI.filters.OutlineFilter;
}
