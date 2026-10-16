namespace gdjs {
  interface OldFilmFilterExtra {
    _animationTimer: number;
    animationFrequency: number;
  }
  interface OldFilmFilterNetworkSyncData {
    se: number;
    n: number;
    ns: number;
    s: number;
    sd: number;
    sw: number;
    v: number;
    va: number;
    vb: number;
    af: number;
  }
  /**
   * `OldFilmFilter` adds its noise to the colors, which are premultiplied by
   * alpha: on transparent pixels, this gives colors that are added on top of
   * the layers below. As the effects of a scene layer are applied on the
   * whole screen, the noise would show everywhere, even when the layer is
   * empty. Scale the noise by alpha so that transparent pixels stay transparent.
   */
  const keepTransparentPixelsTransparent = (filter: PIXI.Filter) => {
    const removeShaderName = (source: string) =>
      source.replace(/#define SHADER_NAME .*\n/, '');
    const { vertexSrc, fragmentSrc } = filter.program;
    filter.program = PIXI.Program.from(
      removeShaderName(vertexSrc),
      removeShaderName(fragmentSrc).replace(
        'color += _noise * noise;',
        'color += _noise * noise * gl_FragColor.a;'
      )
    );
  };

  gdjs.PixiFiltersTools.registerFilterCreator(
    'OldFilm',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(layer, effectData) {
        const filter = new PIXI.filters.OldFilmFilter();
        keepTransparentPixelsTransparent(filter);
        const oldFilmFilter = filter as unknown as PIXI.filters.OldFilmFilter &
          OldFilmFilterExtra;
        oldFilmFilter._animationTimer = 0;
        return oldFilmFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {
        const oldFilmFilter = filter as unknown as PIXI.filters.OldFilmFilter &
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
        const oldFilmFilter = filter as unknown as PIXI.filters.OldFilmFilter &
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
        const oldFilmFilter = filter as unknown as PIXI.filters.OldFilmFilter &
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
      getNetworkSyncData(filter: PIXI.Filter): OldFilmFilterNetworkSyncData {
        const oldFilmFilter = filter as unknown as PIXI.filters.OldFilmFilter &
          OldFilmFilterExtra;
        return {
          se: oldFilmFilter.sepia,
          n: oldFilmFilter.noise,
          ns: oldFilmFilter.noiseSize,
          s: oldFilmFilter.scratch,
          sd: oldFilmFilter.scratchDensity,
          sw: oldFilmFilter.scratchWidth,
          v: oldFilmFilter.vignetting,
          va: oldFilmFilter.vignettingAlpha,
          vb: oldFilmFilter.vignettingBlur,
          af: oldFilmFilter.animationFrequency,
        };
      }
      updateFromNetworkSyncData(
        filter: PIXI.Filter,
        data: OldFilmFilterNetworkSyncData
      ) {
        const oldFilmFilter = filter as unknown as PIXI.filters.OldFilmFilter &
          OldFilmFilterExtra;
        oldFilmFilter.sepia = data.se;
        oldFilmFilter.noise = data.n;
        oldFilmFilter.noiseSize = data.ns;
        oldFilmFilter.scratch = data.s;
        oldFilmFilter.scratchDensity = data.sd;
        oldFilmFilter.scratchWidth = data.sw;
        oldFilmFilter.vignetting = data.v;
        oldFilmFilter.vignettingAlpha = data.va;
        oldFilmFilter.vignettingBlur = data.vb;
        oldFilmFilter.animationFrequency = data.af;
      }
    })()
  );
}
