declare namespace PIXI.filters {
  export type PointLike = PIXI.Point | number[];
  interface ShockwaveFilterOptions {
    amplitude: number;
    wavelength: number;
    speed: number;
    brightness: number;
    radius: number;
  }
  /**
   * The ShockwaveFilter class lets you apply a shockwave effect.<br>
   *
   * @class
   * @extends PIXI.Filter
   * @see {@link https://www.npmjs.com/package/@pixi/filter-shockwave|@pixi/filter-shockwave}
   * @see {@link https://www.npmjs.com/package/pixi-filters|pixi-filters}
   */
  export class ShockwaveFilter extends PIXI.Filter {
    /** Default constructor options. */
    static readonly defaults: ShockwaveFilterOptions;
    /**
     * Sets the elapsed time of the shockwave.
     * It could control the current size of shockwave.
     */
    time: number;
    /**
     * @param {PIXI.Point|number[]} [center=[0.5, 0.5]] - See `center` property.
     * @param {object} [options] - The optional parameters of shockwave filter.
     * @param {number} [options.amplitude=0.5] - See `amplitude`` property.
     * @param {number} [options.wavelength=1.0] - See `wavelength` property.
     * @param {number} [options.speed=500.0] - See `speed` property.
     * @param {number} [options.brightness=8] - See `brightness` property.
     * @param {number} [options.radius=4] - See `radius` property.
     * @param {number} [time=0] - See `time` property.
     */
    constructor(
      center?: PointLike,
      options?: Partial<ShockwaveFilterOptions>,
      time?: number
    );
    apply(
      filterManager: PIXI.FilterSystem,
      input: PIXI.RenderTexture,
      output: PIXI.RenderTexture,
      clear: PIXI.CLEAR_MODES
    ): void;
    /**
     * Sets the center of the shockwave in normalized screen coords. That is
     * (0,0) is the top-left and (1,1) is the bottom right.
     *
     * @member {PIXI.Point|number[]}
     */
    get center(): PointLike;
    set center(value: PointLike);
    /**
     * The amplitude of the shockwave.
     */
    get amplitude(): number;
    set amplitude(value: number);
    /**
     * The wavelength of the shockwave.
     */
    get wavelength(): number;
    set wavelength(value: number);
    /**
     * The brightness of the shockwave.
     */
    get brightness(): number;
    set brightness(value: number);
    /**
     * The speed about the shockwave ripples out.
     * The unit is `pixel/second`
     */
    get speed(): number;
    set speed(value: number);
    /**
     * The maximum radius of shockwave.
     * `< 0.0` means it's infinity.
     */
    get radius(): number;
    set radius(value: number);
  }
}

declare module '@pixi/filter-shockwave' {
  export import ShockwaveFilter = PIXI.filters.ShockwaveFilter;
  export import ShockwaveFilterOptions = PIXI.filters.ShockwaveFilterOptions;
}
