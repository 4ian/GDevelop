declare namespace PIXI.filters {
  export class AsciiFilter extends PIXI.Filter {
    constructor(size?: number);
    size: number;
  }
}

declare module '@pixi/filter-ascii' {
  export import AsciiFilter = PIXI.filters.AsciiFilter;
}
