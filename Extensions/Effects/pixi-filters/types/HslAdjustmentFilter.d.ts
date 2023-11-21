declare namespace PIXI.filters {
  export interface HslAdjustmentFilterOptions {
    hue: number;
    saturation: number;
    lightness: number;
    colorize: boolean;
    alpha: number;
  }
  /**
   * @class
   * @extends PIXI.Filter
   * @see {@link https://www.npmjs.com/package/@pixi/filter-hsl-adjustment|@pixi/filter-hsl-adjustment}
   * @see {@link https://www.npmjs.com/package/pixi-filters|pixi-filters}
   */
  export class HslAdjustmentFilter extends PIXI.Filter {
    private _hue;
    /** Default values for options. */
    static readonly defaults: HslAdjustmentFilterOptions;
    /**
     * @param options - The optional parameters of the filter.
     * @param {number} [options.hue=0] - The amount of hue in degrees (-180 to 180)
     * @param {number} [options.saturation=0] - The amount of color saturation (-1 to 1)
     * @param {number} [options.lightness=0] - The amount of lightness (-1 to 1)
     * @param {boolean} [options.colorize=false] - Whether to colorize the image
     * @param {number} [options.alpha=1] - The amount of alpha (0 to 1)
     */
    constructor(options?: Partial<HslAdjustmentFilterOptions>);
    /**
     * Hue (-180 to 180)
     * @default 0
     */
    get hue(): number;
    set hue(value: number);
    /**
     * Alpha (0-1)
     * @default 1
     */
    get alpha(): number;
    set alpha(value: number);
    /**
     * Colorize (render as a single color)
     * @default false
     */
    get colorize(): boolean;
    set colorize(value: boolean);
    /**
     * Lightness (-1 to 1)
     * @default 0
     */
    get lightness(): number;
    set lightness(value: number);
    /**
     * Saturation (-1 to 1)
     * @default 0
     */
    get saturation(): number;
    set saturation(value: number);
  }
}
declare module '@pixi/filter-hsl-adjustment' {
  export import HslAdjustmentFilter = PIXI.filters.HslAdjustmentFilter;
  export import HslAdjustmentFilterOptions = PIXI.filters.HslAdjustmentFilterOptions;
}
