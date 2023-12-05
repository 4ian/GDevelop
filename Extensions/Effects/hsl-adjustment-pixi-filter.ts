namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'HslAdjustment',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const hslAdjustmentFilter = new PIXI.filters.HslAdjustmentFilter();
        return hslAdjustmentFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const hslAdjustmentFilter = filter as PIXI.filters.HslAdjustmentFilter;
        if (parameterName === 'hue') {
          hslAdjustmentFilter.hue = value;
        } else if (parameterName === 'saturation') {
          hslAdjustmentFilter.saturation = value;
        } else if (parameterName === 'lightness') {
          hslAdjustmentFilter.lightness = value;
        } else if (parameterName === 'alpha') {
          hslAdjustmentFilter.alpha = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const hslAdjustmentFilter = filter as PIXI.filters.HslAdjustmentFilter;
        if (parameterName === 'hue') {
          return hslAdjustmentFilter.hue;
        }
        if (parameterName === 'saturation') {
          return hslAdjustmentFilter.saturation;
        }
        if (parameterName === 'lightness') {
          return hslAdjustmentFilter.lightness;
        }
        if (parameterName === 'alpha') {
          return hslAdjustmentFilter.alpha;
        }
        return 0;
      }
      updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) {}
      updateColorParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ): void {}
      getColorParameter(filter: PIXI.Filter, parameterName: string): number {
        return 0;
      }
      updateBooleanParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: boolean
      ) {
        const hslAdjustmentFilter = filter as PIXI.filters.HslAdjustmentFilter;
        if (parameterName === 'colorize') {
          hslAdjustmentFilter.colorize = value;
        }
      }
    })()
  );
}
