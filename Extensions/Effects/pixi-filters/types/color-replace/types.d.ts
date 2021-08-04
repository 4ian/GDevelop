declare module 'pixi.js' {
  namespace filters {
    export class ColorReplaceFilter extends PIXI.Filter {
      constructor(
        originalColor?: number | number[],
        newColor?: number | number[],
        epsilon?: number
      );
      epsilon: number;
      originalColor: number | number[];
      newColor: number | number[];
    }
  }
}

declare module '@pixi/filter-color-replace' {
  export import ColorReplaceFilter = PIXI.filters.ColorReplaceFilter;
}
