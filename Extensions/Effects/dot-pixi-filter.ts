namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Dot',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const dotFilter = new PIXI.filters.DotFilter();
        return dotFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const dotFilter = (filter as unknown) as PIXI.filters.DotFilter;
        if (parameterName === 'scale') {
          dotFilter.scale = value;
        } else if (parameterName === 'angle') {
          dotFilter.angle = value;
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
