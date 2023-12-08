namespace gdjs {
  interface OldFilmFilterExtra {
    _animationTimer: number;
    animationFrequency: number;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'OldFilm',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(layer, effectData) {
        const filter = new PIXI.filters.OldFilmFilter();
        const oldFilmFilter = (filter as unknown) as PIXI.filters.OldFilmFilter &
          OldFilmFilterExtra;
        oldFilmFilter._animationTimer = 0;
        return oldFilmFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {
        const oldFilmFilter = (filter as unknown) as PIXI.filters.OldFilmFilter &
          OldFilmFilterExtra;
        if (oldFilmFilter.animationFrequency !== 0) {
          oldFilmFilter._animationTimer += target.getElapsedTime() / 1000;
          if (
            oldFilmFilter._animationTimer >=
            1 / oldFilmFilter.animationFrequency
          ) {
            oldFilmFilter.seed = Math.random();
            oldFilmFilter._animationTimer = 0;
          }
        }
      }
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const oldFilmFilter = (filter as unknown) as PIXI.filters.OldFilmFilter &
          OldFilmFilterExtra;
        if (parameterName === 'sepia') {
          oldFilmFilter.sepia = value;
        } else if (parameterName === 'noise') {
          oldFilmFilter.noise = value;
        } else if (parameterName === 'noiseSize') {
          oldFilmFilter.noiseSize = value;
        } else if (parameterName === 'scratch') {
          oldFilmFilter.scratch = value;
        } else if (parameterName === 'scratchDensity') {
          oldFilmFilter.scratchDensity = value;
        } else if (parameterName === 'scratchWidth') {
          oldFilmFilter.scratchWidth = value;
        } else if (parameterName === 'vignetting') {
          oldFilmFilter.vignetting = value;
        } else if (parameterName === 'vignettingAlpha') {
          oldFilmFilter.vignettingAlpha = value;
        } else if (parameterName === 'vignettingBlur') {
          oldFilmFilter.vignettingBlur = value;
        } else if (parameterName === 'animationFrequency') {
          oldFilmFilter.animationFrequency = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const oldFilmFilter = (filter as unknown) as PIXI.filters.OldFilmFilter &
          OldFilmFilterExtra;
        if (parameterName === 'sepia') {
          return oldFilmFilter.sepia;
        }
        if (parameterName === 'noise') {
          return oldFilmFilter.noise;
        }
        if (parameterName === 'noiseSize') {
          return oldFilmFilter.noiseSize;
        }
        if (parameterName === 'scratch') {
          return oldFilmFilter.scratch;
        }
        if (parameterName === 'scratchDensity') {
          return oldFilmFilter.scratchDensity;
        }
        if (parameterName === 'scratchWidth') {
          return oldFilmFilter.scratchWidth;
        }
        if (parameterName === 'vignetting') {
          return oldFilmFilter.vignetting;
        }
        if (parameterName === 'vignettingAlpha') {
          return oldFilmFilter.vignettingAlpha;
        }
        if (parameterName === 'vignettingBlur') {
          return oldFilmFilter.vignettingBlur;
        }
        if (parameterName === 'animationFrequency') {
          return oldFilmFilter.animationFrequency;
        }
        return 0;
      }
      updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) {}
      updateColorParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ): void {}
      getColorParameter(filter: PIXI.Filter, parameterName: string): number {
        return 0;
      }
      updateBooleanParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: boolean
      ) {}
    })()
  );
}
