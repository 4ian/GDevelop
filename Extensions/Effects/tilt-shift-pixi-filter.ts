namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('TiltShift', {
    makePIXIFilter: function (target, effectData) {
      const tiltShiftFilter = new PIXI.filters.TiltShiftFilter();
      return tiltShiftFilter;
    },
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const tiltShiftFilter = filter as unknown as PIXI.filters.TiltShiftFilter;
      if (parameterName === 'blur') {
        tiltShiftFilter.blur = value;
      } else if (parameterName === 'gradientBlur') {
        tiltShiftFilter.gradientBlur = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
