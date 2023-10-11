namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Bevel',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const bevelFilter = new PIXI.filters.BevelFilter();
        return bevelFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const bevelFilter = (filter as unknown) as PIXI.filters.BevelFilter;
        if (parameterName === 'rotation') {
          bevelFilter.rotation = value;
        } else if (parameterName === 'thickness') {
          bevelFilter.thickness = value;
        } else if (parameterName === 'distance') {
          // @ts-ignore
          bevelFilter.distance = value;
        } else if (parameterName === 'lightAlpha') {
          bevelFilter.lightAlpha = value;
        } else if (parameterName === 'shadowAlpha') {
          bevelFilter.shadowAlpha = value;
        }
      }
      updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) {
        const bevelFilter = (filter as unknown) as PIXI.filters.BevelFilter;
        if (parameterName === 'lightColor') {
          bevelFilter.lightColor = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(
            value
          );
        }
        if (parameterName === 'shadowColor') {
          bevelFilter.shadowColor = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(
            value
          );
        }
      }
      updateBooleanParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: boolean
      ) {}
    })()
  );
}
