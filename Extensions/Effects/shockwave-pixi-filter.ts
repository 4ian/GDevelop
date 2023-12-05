namespace gdjs {
  interface ShockwaveFilterExtra {
    // extra properties are stored on the filter.
    _centerX: number;
    _centerY: number;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Shockwave',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const shockwaveFilter = new PIXI.filters.ShockwaveFilter([0.5, 0.5]);
        return shockwaveFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {
        const shockwaveFilter = (filter as unknown) as PIXI.filters.ShockwaveFilter &
          ShockwaveFilterExtra;
        if (shockwaveFilter.speed !== 0) {
          shockwaveFilter.time += target.getElapsedTime() / 1000;
        }
        shockwaveFilter.center[0] = Math.round(
          shockwaveFilter._centerX * target.getWidth()
        );
        shockwaveFilter.center[1] = Math.round(
          shockwaveFilter._centerY * target.getHeight()
        );
      }
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const shockwaveFilter = filter as PIXI.filters.ShockwaveFilter &
          ShockwaveFilterExtra;
        if (parameterName === 'centerX') {
          shockwaveFilter._centerX = value;
        } else if (parameterName === 'centerY') {
          shockwaveFilter._centerY = value;
        } else if (parameterName === 'time') {
          shockwaveFilter.time = value;
        } else if (parameterName === 'speed') {
          shockwaveFilter.speed = value;
        } else if (parameterName === 'amplitude') {
          shockwaveFilter.amplitude = value;
        } else if (parameterName === 'wavelength') {
          shockwaveFilter.wavelength = value;
        } else if (parameterName === 'brightness') {
          shockwaveFilter.brightness = value;
        } else if (parameterName === 'radius') {
          shockwaveFilter.radius = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const shockwaveFilter = filter as PIXI.filters.ShockwaveFilter &
          ShockwaveFilterExtra;
        if (parameterName === 'centerX') {
          return shockwaveFilter._centerX;
        }
        if (parameterName === 'centerY') {
          return shockwaveFilter._centerY;
        }
        if (parameterName === 'time') {
          return shockwaveFilter.time;
        }
        if (parameterName === 'speed') {
          return shockwaveFilter.speed;
        }
        if (parameterName === 'amplitude') {
          return shockwaveFilter.amplitude;
        }
        if (parameterName === 'wavelength') {
          return shockwaveFilter.wavelength;
        }
        if (parameterName === 'brightness') {
          return shockwaveFilter.brightness;
        }
        if (parameterName === 'radius') {
          return shockwaveFilter.radius;
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
