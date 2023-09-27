namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Blur',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const blur = new PIXI.BlurFilter();
        return blur;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        if (
          parameterName !== 'blur' &&
          parameterName !== 'quality' &&
          parameterName !== 'kernelSize' &&
          parameterName !== 'resolution'
        ) {
          return;
        }
        if (parameterName === 'kernelSize') {
          value = gdjs.PixiFiltersTools.clampKernelSize(value, 5, 15);
        }
        filter[parameterName] = value;
      }
      updateStringParameter(filter, parameterName, value) {}
      updateBooleanParameter(filter, parameterName, value) {}
    })()
  );
}
