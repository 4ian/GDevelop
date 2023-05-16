namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Brightness',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const brightness = new PIXI.filters.ColorMatrixFilter();
        brightness.brightness(1, false);
        return brightness;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        // @ts-ignore - unsure why PIXI.filters is not recognised.
        const brightnessFilter = (filter as unknown) as PIXI.filters.ColorMatrixFilter;
        if (parameterName !== 'brightness') {
          return;
        }
        brightnessFilter.brightness(
          gdjs.PixiFiltersTools.clampValue(value, 0, 1),
          false
        );
      }
      updateStringParameter(filter, parameterName, value) {}
      updateBooleanParameter(filter, parameterName, value) {}
    })()
  );
}
