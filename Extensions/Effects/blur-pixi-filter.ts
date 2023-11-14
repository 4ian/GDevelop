namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Blur',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const blur = new PIXI.BlurFilter();
        return blur;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
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
