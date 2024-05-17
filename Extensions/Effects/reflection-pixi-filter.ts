namespace gdjs {
  interface ReflectionFilterExtra {
    _animationTimer: number;
    animationSpeed: number;
    animationFrequency: number;
  }
  interface ReflectionFilterNetworkSyncData {
    b: number;
    ams: number;
    ame: number;
    wls: number;
    wle: number;
    als: number;
    ale: number;
    as: number;
    m: boolean;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Reflection',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(layer, effectData) {
        let time = 0;
        const reflectionFilter = new PIXI.filters.ReflectionFilter({
          mirror: effectData.booleanParameters.mirror,
          boundary: effectData.doubleParameters.boundary,
          amplitude: [
            effectData.doubleParameters.amplitudeStart,
            effectData.doubleParameters.amplitudeEnding,
          ],
          waveLength: [
            effectData.doubleParameters.waveLengthStart,
            effectData.doubleParameters.waveLengthEnding,
          ],
          alpha: [
            effectData.doubleParameters.alphaStart,
            effectData.doubleParameters.alphaEnding,
          ],
          time,
        });
        return reflectionFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {
        const reflectionFilter = (filter as unknown) as PIXI.filters.ReflectionFilter &
          ReflectionFilterExtra;
        if (reflectionFilter.animationSpeed !== 0) {
          reflectionFilter.time +=
            (target.getElapsedTime() / 1000) * reflectionFilter.animationSpeed;
        }
      }
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const reflectionFilter = (filter as unknown) as PIXI.filters.ReflectionFilter &
          ReflectionFilterExtra;
        if (parameterName === 'boundary') {
          reflectionFilter.boundary = value;
        }
        if (parameterName === 'amplitudeStart') {
          reflectionFilter.amplitude[0] = value;
        }
        if (parameterName === 'amplitudeEnding') {
          reflectionFilter.amplitude[1] = value;
        }
        if (parameterName === 'waveLengthStart') {
          reflectionFilter.waveLength[0] = value;
        }
        if (parameterName === 'waveLengthEnding') {
          reflectionFilter.waveLength[1] = value;
        }
        if (parameterName === 'alphaStart') {
          reflectionFilter.alpha[0] = value;
        }
        if (parameterName === 'alphaEnding') {
          reflectionFilter.alpha[1] = value;
        }
        if (parameterName === 'animationSpeed') {
          reflectionFilter.animationSpeed = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const reflectionFilter = (filter as unknown) as PIXI.filters.ReflectionFilter &
          ReflectionFilterExtra;
        if (parameterName === 'boundary') {
          return reflectionFilter.boundary;
        }
        if (parameterName === 'amplitudeStart') {
          return reflectionFilter.amplitude[0];
        }
        if (parameterName === 'amplitudeEnding') {
          return reflectionFilter.amplitude[1];
        }
        if (parameterName === 'waveLengthStart') {
          return reflectionFilter.waveLength[0];
        }
        if (parameterName === 'waveLengthEnding') {
          return reflectionFilter.waveLength[1];
        }
        if (parameterName === 'alphaStart') {
          return reflectionFilter.alpha[0];
        }
        if (parameterName === 'alphaEnding') {
          return reflectionFilter.alpha[1];
        }
        if (parameterName === 'animationSpeed') {
          return reflectionFilter.animationSpeed;
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
        const reflectionFilter = (filter as unknown) as PIXI.filters.ReflectionFilter &
          ReflectionFilterExtra;
        if (parameterName === 'mirror') {
          reflectionFilter.mirror = value;
        }
      }
      getNetworkSyncData(filter: PIXI.Filter): ReflectionFilterNetworkSyncData {
        const reflectionFilter = (filter as unknown) as PIXI.filters.ReflectionFilter &
          ReflectionFilterExtra;
        return {
          b: reflectionFilter.boundary,
          ams: reflectionFilter.amplitude[0],
          ame: reflectionFilter.amplitude[1],
          wls: reflectionFilter.waveLength[0],
          wle: reflectionFilter.waveLength[1],
          als: reflectionFilter.alpha[0],
          ale: reflectionFilter.alpha[1],
          as: reflectionFilter.animationSpeed,
          m: reflectionFilter.mirror,
        };
      }
      updateFromNetworkSyncData(
        filter: PIXI.Filter,
        data: ReflectionFilterNetworkSyncData
      ) {
        const reflectionFilter = (filter as unknown) as PIXI.filters.ReflectionFilter &
          ReflectionFilterExtra;
        reflectionFilter.boundary = data.b;
        reflectionFilter.amplitude[0] = data.ams;
        reflectionFilter.amplitude[1] = data.ame;
        reflectionFilter.waveLength[0] = data.wls;
        reflectionFilter.waveLength[1] = data.wle;
        reflectionFilter.alpha[0] = data.als;
        reflectionFilter.alpha[1] = data.ale;
        reflectionFilter.animationSpeed = data.as;
        reflectionFilter.mirror = data.m;
      }
    })()
  );
}
