namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'TiltShift',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const tiltShiftFilter = new PIXI.filters.TiltShiftFilter();
        return tiltShiftFilter;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        const tiltShiftFilter = (filter as unknown) as PIXI.filters.TiltShiftFilter;
        if (parameterName === 'blur') {
          tiltShiftFilter.blur = value;
        } else if (parameterName === 'gradientBlur') {
          tiltShiftFilter.gradientBlur = value;
        }
      }
      updateStringParameter(filter, parameterName, value) {}
      updateBooleanParameter(filter, parameterName, value) {}
    })()
  );
}
