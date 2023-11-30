namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Brightness',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const brightness = new PIXI.ColorMatrixFilter();
        brightness.brightness(1, false);
        return brightness;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const brightnessFilter = (filter as unknown) as PIXI.ColorMatrixFilter;
        if (parameterName !== 'brightness') {
          return;
        }
        brightnessFilter.brightness(
          gdjs.PixiFiltersTools.clampValue(value, 0, 1),
          false
        );
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
