declare module 'pixi.js' {
  namespace filters {
    class CrossHatchFilter extends PIXI.Filter {
      constructor();
    }
  }
}
declare module '@pixi/filter-cross-hatch' {
  export import CrossHatchFilter = PIXI.filters.CrossHatchFilter;
}
