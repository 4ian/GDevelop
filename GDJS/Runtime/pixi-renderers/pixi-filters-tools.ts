namespace gdjs {
  export namespace PixiFiltersTools {
    export const clampValue = function (value, min, max) {
      return Math.max(min, Math.min(max, value));
    };
    export const clampKernelSize = function (value, min, max) {
      const len = Math.round((max - min) / 2 + 1);
      const arr = new Array(len);
      for (let i = 0; i < len; i++) {
        arr[i] = min + 2 * i;
      }
      return arr.indexOf(value) !== -1 ? value : min;
    };

    const _filterCreators: {
      [filterName: string]: FilterCreator;
    } = {};

    /**
     * Enable an effect.
     * @param filter The filter to enable or disable
     * @param value Set to true to enable, false to disable
     */
    export const enableEffect = function (
      filter: Filter,
      value: boolean
    ) {
      filter.pixiFilter.enabled = value;
    };

    /**
     * Check if an effect is enabled.
     * @param filter The filter to be checked
     * @return true if the filter is enabled
     */
    export const isEffectEnabled = function (
      filter: Filter
    ): boolean {
      return filter.pixiFilter.enabled;
    };

    /**
     * Return the creator for the filter with the given name, if any.
     * @param filterName The name of the filter to get
     * @return The filter creator, if any (null otherwise).
     */
    export const getFilterCreator = function (
      filterName: string
    ): FilterCreator | null {
      if (_filterCreators.hasOwnProperty(filterName)) {
        return _filterCreators[filterName];
      }
      return null;
    };

    /**
     * Register a new PIXI filter creator, to be used by GDJS.
     * @param filterName The name of the filter to get
     * @param filterCreator The object used to create the filter.
     */
    export const registerFilterCreator = function (
      filterName: string,
      filterCreator: FilterCreator
    ) {
      if (_filterCreators.hasOwnProperty(filterName)) {
        console.warn(
          'Filter "' +
            filterName +
            '" was already registered in gdjs.PixiFiltersTools. Replacing it with the new one.'
        );
      }
      _filterCreators[filterName] = filterCreator;
    };

    /**
     * Convert a string RGB color ("rrr;ggg;bbb") or a hex string (#rrggbb) to a hex number.
     * @param value The color as a RGB string or hex string
     */
    export const rgbOrHexToHexNumber = function (value: string): number {
      const splitValue = value.split(';');
      if (splitValue.length === 3) {
        return gdjs.rgbToHexNumber(
          parseInt(splitValue[0], 0),
          parseInt(splitValue[1], 0),
          parseInt(splitValue[2], 0)
        );
      }
      return parseInt(value.replace('#', '0x'), 16);
    };

    /** A wrapper allowing to create a PIXI filter and update it using a common interface */
    export type FilterCreator = {
      /** Function to call to create the filter */
      makePIXIFilter: (layer: gdjs.Layer, effectData: EffectData) => any;
      /** The function to be called to update the filter at every frame */
      update: (filter: PIXI.Filter, layer: gdjs.Layer) => any;
      /** The function to be called to update a parameter (with a number) */
      updateDoubleParameter: (
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) => void;
      /** The function to be called to update a parameter (with a string) */
      updateStringParameter: (
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) => void;
      /** The function to be called to update a parameter (with a boolean) */
      updateBooleanParameter: (
        filter: PIXI.Filter,
        parameterName: string,
        value: boolean
      ) => void;
    };

    /** The type of a filter used to manipulate a Pixi filter. */
    export type Filter = {
      /** The PIXI filter */
      pixiFilter: PIXI.Filter;
      /** The function to be called to update the filter at every frame */
      update: (filter: PIXI.Filter, layer: gdjs.Layer) => any;
      /** The function to be called to update a parameter (with a number) */
      updateDoubleParameter: (
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) => void;
      /** The function to be called to update a parameter (with a string) */
      updateStringParameter: (
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) => void;
      /** The function to be called to update a parameter (with a boolean) */
      updateBooleanParameter: (
        filter: PIXI.Filter,
        parameterName: string,
        value: boolean
      ) => void;
    };
  }
}
