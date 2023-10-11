namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Shockwave',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const shockwaveFilter = new PIXI.filters.ShockwaveFilter([0.5, 0.5]);
        return shockwaveFilter;
      }
      updatePreRender(filter, target) {
        const shockwaveFilter = (filter as unknown) as PIXI.filters.ShockwaveFilter;
        if (shockwaveFilter.speed !== 0) {
          filter.time += target.getElapsedTime() / 1000;
        }
        shockwaveFilter.center[0] = Math.round(
          // @ts-ignore - extra properties are stored on the filter.
          shockwaveFilter._centerX * target.getWidth()
        );
        shockwaveFilter.center[1] = Math.round(
          // @ts-ignore - extra properties are stored on the filter.
          shockwaveFilter._centerY * target.getHeight()
        );
      }
      updateDoubleParameter(filter, parameterName, value) {
        const shockwaveFilter = (filter as unknown) as PIXI.filters.ShockwaveFilter;
        if (parameterName === 'centerX') {
          // @ts-ignore - extra properties are stored on the filter.
          shockwaveFilter._centerX = value;
        } else if (parameterName === 'centerY') {
          // @ts-ignore - extra properties are stored on the filter.
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
      updateStringParameter(filter, parameterName, value) {}
      updateBooleanParameter(filter, parameterName, value) {}
    })()
  );
}
