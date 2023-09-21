declare namespace PIXI.filters {
  export class ConvolutionFilter extends PIXI.Filter {
    constructor(matrix: number[], width: number, height: number);
    height: number;
    width: number;
    matrix: number[];
  }
}

declare module '@pixi/filter-convolution' {
  export import ConvolutionFilter = PIXI.filters.ConvolutionFilter;
}
