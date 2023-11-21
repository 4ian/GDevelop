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
      updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) {}
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
