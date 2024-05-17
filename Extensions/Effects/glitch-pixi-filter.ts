namespace gdjs {
  interface GlitchFilterExtra {
    _animationTimer: number;
    animationFrequency: number;
  }
  interface GlitchFilterNetworkSyncData {
    s: number;
    o: number;
    d: number;
    fm: number;
    ms: number;
    ss: number;
    rx: number;
    ry: number;
    gx: number;
    gy: number;
    bx: number;
    by: number;
    af: number;
    a: boolean;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Glitch',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(layer, effectData) {
        const filter = new PIXI.filters.GlitchFilter();
        const glitchFilter = (filter as unknown) as PIXI.filters.GlitchFilter &
          GlitchFilterExtra;
        glitchFilter._animationTimer = 0;
        return glitchFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {
        const glitchFilter = (filter as unknown) as PIXI.filters.GlitchFilter &
          GlitchFilterExtra;
        if (glitchFilter.animationFrequency !== 0) {
          glitchFilter._animationTimer += target.getElapsedTime() / 1000;
          if (
            glitchFilter._animationTimer >=
            1 / glitchFilter.animationFrequency
          ) {
            glitchFilter.seed = Math.random();
            glitchFilter._animationTimer = 0;
          }
        }
      }
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const glitchFilter = (filter as unknown) as PIXI.filters.GlitchFilter &
          GlitchFilterExtra;
        if (parameterName === 'slices') {
          glitchFilter.slices = value;
        } else if (parameterName === 'offset') {
          glitchFilter.offset = value;
        } else if (parameterName === 'direction') {
          glitchFilter.direction = value;
        } else if (parameterName === 'fillMode') {
          glitchFilter.fillMode = value;
        } else if (parameterName === 'minSize') {
          glitchFilter.minSize = value;
        } else if (parameterName === 'sampleSize') {
          glitchFilter.sampleSize = value;
        } else if (parameterName === 'redX') {
          glitchFilter.red.x = value;
        } else if (parameterName === 'redY') {
          glitchFilter.red.y = value;
        } else if (parameterName === 'greenX') {
          glitchFilter.green.x = value;
        } else if (parameterName === 'greenY') {
          glitchFilter.green.y = value;
        } else if (parameterName === 'blueX') {
          glitchFilter.blue.x = value;
        } else if (parameterName === 'blueY') {
          glitchFilter.blue.y = value;
        } else if (parameterName === 'animationFrequency') {
          glitchFilter.animationFrequency = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const glitchFilter = (filter as unknown) as PIXI.filters.GlitchFilter &
          GlitchFilterExtra;
        if (parameterName === 'slices') {
          return glitchFilter.slices;
        }
        if (parameterName === 'offset') {
          return glitchFilter.offset;
        }
        if (parameterName === 'direction') {
          return glitchFilter.direction;
        }
        if (parameterName === 'fillMode') {
          return glitchFilter.fillMode;
        }
        if (parameterName === 'minSize') {
          return glitchFilter.minSize;
        }
        if (parameterName === 'sampleSize') {
          return glitchFilter.sampleSize;
        }
        if (parameterName === 'redX') {
          return glitchFilter.red.x;
        }
        if (parameterName === 'redY') {
          return glitchFilter.red.y;
        }
        if (parameterName === 'greenX') {
          return glitchFilter.green.x;
        }
        if (parameterName === 'greenY') {
          return glitchFilter.green.y;
        }
        if (parameterName === 'blueX') {
          return glitchFilter.blue.x;
        }
        if (parameterName === 'blueY') {
          return glitchFilter.blue.y;
        }
        if (parameterName === 'animationFrequency') {
          return glitchFilter.animationFrequency;
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
      ) {
        const glitchFilter = (filter as unknown) as PIXI.filters.GlitchFilter &
          GlitchFilterExtra;
        if (parameterName === 'average') {
          glitchFilter.average = value;
        }
      }
      getNetworkSyncData(filter: PIXI.Filter): GlitchFilterNetworkSyncData {
        const glitchFilter = (filter as unknown) as PIXI.filters.GlitchFilter &
          GlitchFilterExtra;
        return {
          s: glitchFilter.slices,
          o: glitchFilter.offset,
          d: glitchFilter.direction,
          fm: glitchFilter.fillMode,
          ms: glitchFilter.minSize,
          ss: glitchFilter.sampleSize,
          rx: glitchFilter.red.x,
          ry: glitchFilter.red.y,
          gx: glitchFilter.green.x,
          gy: glitchFilter.green.y,
          bx: glitchFilter.blue.x,
          by: glitchFilter.blue.y,
          af: glitchFilter.animationFrequency,
          a: glitchFilter.average,
        };
      }
      updateFromNetworkSyncData(
        filter: PIXI.Filter,
        data: GlitchFilterNetworkSyncData
      ) {
        const glitchFilter = (filter as unknown) as PIXI.filters.GlitchFilter &
          GlitchFilterExtra;
        glitchFilter.slices = data.s;
        glitchFilter.offset = data.o;
        glitchFilter.direction = data.d;
        glitchFilter.fillMode = data.fm;
        glitchFilter.minSize = data.ms;
        glitchFilter.sampleSize = data.ss;
        glitchFilter.red.x = data.rx;
        glitchFilter.red.y = data.ry;
        glitchFilter.green.x = data.gx;
        glitchFilter.green.y = data.gy;
        glitchFilter.blue.x = data.bx;
        glitchFilter.blue.y = data.by;
        glitchFilter.animationFrequency = data.af;
        glitchFilter.average = data.a;
      }
    })()
  );
}
