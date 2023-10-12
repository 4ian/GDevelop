// @ts-nocheck - TODO: fix typings in this file

namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'OldFilm',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(layer, effectData) {
        const oldFilmFilter = new PIXI.filters.OldFilmFilter();
        oldFilmFilter._animationTimer = 0;
        return oldFilmFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {
        if (filter.animationFrequency !== 0) {
          filter._animationTimer += target.getElapsedTime() / 1000;
          if (filter._animationTimer >= 1 / filter.animationFrequency) {
            filter.seed = Math.random();
            filter._animationTimer = 0;
          }
        }
      }
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        if (parameterName === 'sepia') {
          filter.sepia = value;
        } else if (parameterName === 'noise') {
          filter.noise = value;
        } else if (parameterName === 'noiseSize') {
          filter.noiseSize = value;
        } else if (parameterName === 'scratch') {
          filter.scratch = value;
        } else if (parameterName === 'scratchDensity') {
          filter.scratchDensity = value;
        } else if (parameterName === 'scratchWidth') {
          filter.scratchWidth = value;
        } else if (parameterName === 'vignetting') {
          filter.vignetting = value;
        } else if (parameterName === 'vignettingAlpha') {
          filter.vignettingAlpha = value;
        } else if (parameterName === 'vignettingBlur') {
          filter.vignettingBlur = value;
        } else if (parameterName === 'animationFrequency') {
          filter.animationFrequency = value;
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
