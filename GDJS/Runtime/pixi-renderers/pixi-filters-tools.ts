namespace gdjs {
  const logger = new gdjs.Logger('Filters');

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
        logger.warn(
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
          parseInt(splitValue[0], 10),
          parseInt(splitValue[1], 10),
          parseInt(splitValue[2], 10)
        );
      }
      return parseInt(value.replace('#', '0x'), 16);
    };

    /** A wrapper allowing to create an effect. */
    export interface FilterCreator {
      /** Function to call to create the filter */
      makeFilter(target: EffectsTarget, effectData: EffectData): Filter;
    }

    /** An effect. */
    export interface Filter {
      /**
       * Check if an effect is enabled.
       * @return true if the filter is enabled
       */
      isEnabled(target: EffectsTarget): boolean;
      /**
       * Enable an effect.
       * @param enabled Set to true to enable, false to disable
       */
      setEnabled(target: EffectsTarget, enabled: boolean): boolean;
      /**
       * Apply the effect on the PixiJS DisplayObject.
       * Called after the effect is initialized.
       * @param rendererObject The renderer object
       * @param effect The effect to be applied.
       */
      applyEffect(target: EffectsTarget): boolean;
      removeEffect(target: EffectsTarget): boolean;
      /** The function to be called to update the filter at every frame before the rendering. */
      updatePreRender(target: gdjs.EffectsTarget): any;
      /** The function to be called to update a parameter (with a number) */
      updateDoubleParameter(
        //filter: PIXI.Filter,
        parameterName: string,
        value: number
      ): void;
      /** The function to be called to update a parameter (with a string) */
      updateStringParameter(parameterName: string, value: string): void;
      /** The function to be called to update a parameter (with a boolean) */
      updateBooleanParameter(parameterName: string, value: boolean): void;
      updateColorParameter(parameterName: string, value: number): void;
      getDoubleParameter(parameterName: string): number;
      getColorParameter(parameterName: string): number;
    }

    /** A wrapper allowing to create a PIXI filter and update it using a common interface */
    export abstract class PixiFilterCreator implements FilterCreator {
      /** Function to call to create the filter */
      makeFilter(target: EffectsTarget, effectData: EffectData): Filter {
        const pixiFilter = this.makePIXIFilter(target, effectData);
        if (target.isLightingLayer && target.isLightingLayer()) {
          pixiFilter.blendMode = PIXI.BLEND_MODES.ADD;
        }
        return new PixiFilter(pixiFilter, this);
      }
      /** Function to call to create the filter */
      abstract makePIXIFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): any;
      /** The function to be called to update the filter at every frame before the rendering. */
      abstract updatePreRender(
        filter: PIXI.Filter,
        target: gdjs.EffectsTarget
      ): any;
      /** The function to be called to update a parameter (with a number) */
      abstract updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ): void;
      /** The function to be called to update a parameter (with a string) */
      abstract updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ): void;
      /** The function to be called to update a parameter (with a boolean) */
      abstract updateBooleanParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: boolean
      ): void;
      abstract updateColorParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ): void;
      abstract getDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string
      ): number;
      abstract getColorParameter(
        filter: PIXI.Filter,
        parameterName: string
      ): number;
    }

    /**An effect used to manipulate a Pixi filter. */
    export class PixiFilter implements Filter {
      /** The PIXI filter */
      pixiFilter: PIXI.Filter;
      filterCreator: gdjs.PixiFiltersTools.PixiFilterCreator;

      constructor(
        pixiFilter: PIXI.Filter,
        filterCreator: gdjs.PixiFiltersTools.PixiFilterCreator
      ) {
        this.pixiFilter = pixiFilter;
        this.filterCreator = filterCreator;
      }

      isEnabled(target: EffectsTarget): boolean {
        return this.pixiFilter.enabled;
      }

      setEnabled(target: EffectsTarget, enabled: boolean): boolean {
        return (this.pixiFilter.enabled = enabled);
      }

      applyEffect(target: EffectsTarget): boolean {
        const rendererObject = target.getRendererObject() as
          | PIXI.DisplayObject
          | null
          | undefined;
        if (!rendererObject) {
          return false;
        }
        rendererObject.filters = (rendererObject.filters || []).concat(
          this.pixiFilter
        );
        return true;
      }

      removeEffect(target: EffectsTarget): boolean {
        const rendererObject = target.getRendererObject() as
          | PIXI.DisplayObject
          | null
          | undefined;
        if (!rendererObject) {
          return false;
        }
        rendererObject.filters = (rendererObject.filters || []).filter(
          (pixiFilter) => pixiFilter !== this.pixiFilter
        );
        return true;
      }

      updatePreRender(target: gdjs.EffectsTarget): any {
        this.filterCreator.updatePreRender(this.pixiFilter, target);
      }

      updateDoubleParameter(parameterName: string, value: number): void {
        this.filterCreator.updateDoubleParameter(
          this.pixiFilter,
          parameterName,
          value
        );
      }

      updateStringParameter(parameterName: string, value: string): void {
        this.filterCreator.updateStringParameter(
          this.pixiFilter,
          parameterName,
          value
        );
      }

      updateBooleanParameter(parameterName: string, value: boolean): void {
        this.filterCreator.updateBooleanParameter(
          this.pixiFilter,
          parameterName,
          value
        );
      }

      updateColorParameter(parameterName: string, value: number): void {
        this.filterCreator.updateColorParameter(
          this.pixiFilter,
          parameterName,
          value
        );
      }

      getDoubleParameter(parameterName: string): number {
        return this.filterCreator.getDoubleParameter(
          this.pixiFilter,
          parameterName
        );
      }

      getColorParameter(parameterName: string): number {
        return this.filterCreator.getColorParameter(
          this.pixiFilter,
          parameterName
        );
      }
    }

    export class EmptyFilter implements Filter {
      isEnabled(target: EffectsTarget): boolean {
        return false;
      }
      setEnabled(target: EffectsTarget, enabled: boolean): boolean {
        return false;
      }
      applyEffect(target: EffectsTarget): boolean {
        return false;
      }
      removeEffect(target: EffectsTarget): boolean {
        return false;
      }
      updatePreRender(target: gdjs.EffectsTarget): any {}
      updateDoubleParameter(parameterName: string, value: number): void {}
      updateStringParameter(parameterName: string, value: string): void {}
      updateBooleanParameter(parameterName: string, value: boolean): void {}
      updateColorParameter(parameterName: string, value: number): void {}
      getDoubleParameter(parameterName: string): number {
        return 0;
      }
      getColorParameter(parameterName: string): number {
        return 0;
      }
    }
  }
}
