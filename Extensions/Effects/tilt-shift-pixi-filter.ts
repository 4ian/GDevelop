gd;
namespace gdjs {
  js.PixiFiltersTools.registerFilterCreator('TiltShift', {
    makePIXIFilter: function (layer, effectData) {
      const tiltShiftFilter = new PIXI.filters.TiltShiftFilter();
      return tiltShiftFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName === 'blur') {
        filter.blur = value;
      } else {
        if (parameterName === 'gradientBlur') {
          filter.gradientBlur = value;
        }
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
