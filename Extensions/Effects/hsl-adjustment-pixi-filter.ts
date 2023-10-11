namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'HslAdjustment',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const hslAdjustmentFilter = new PIXI.filters.HslAdjustmentFilter();
        return hslAdjustmentFilter;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        const hslAdjustmentFilter = (filter as unknown) as PIXI.filters.HslAdjustmentFilter;
        if (parameterName === 'hue') {
          hslAdjustmentFilter.hue = value;
        } else if (parameterName === 'saturation') {
          hslAdjustmentFilter.saturation = value;
        } else if (parameterName === 'lightness') {
          hslAdjustmentFilter.lightness = value;
        } else if (parameterName === 'colorize') {
          hslAdjustmentFilter.colorize = value;
        } else if (parameterName === 'alpha') {
          hslAdjustmentFilter.alpha = value;
        }
      }
      updateStringParameter(filter, parameterName, value) {}
      updateBooleanParameter(filter, parameterName, value) {}
    })()
  );
}
