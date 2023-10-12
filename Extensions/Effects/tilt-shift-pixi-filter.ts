namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'TiltShift',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const tiltShiftFilter = new PIXI.filters.TiltShiftFilter();
        return tiltShiftFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const tiltShiftFilter = (filter as unknown) as PIXI.filters.TiltShiftFilter;
        if (parameterName === 'blur') {
          tiltShiftFilter.blur = value;
        } else if (parameterName === 'gradientBlur') {
          tiltShiftFilter.gradientBlur = value;
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
      ) {}
    })()
  );
}
