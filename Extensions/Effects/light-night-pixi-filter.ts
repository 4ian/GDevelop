namespace gdjs {
  export interface LightNightFilterExtra {
    o: number;
  }
  export class LightNightPixiFilter extends PIXI.Filter {
    constructor() {
      const fragment = [
        'precision mediump float;',
        '',
        'varying vec2 vTextureCoord;',
        'uniform sampler2D uSampler;',
        'uniform float opacity;',
        '',
        'void main(void)',
        '{',
        '   mat3 nightMatrix = mat3(0.6, 0, 0, 0, 0.7, 0, 0, 0, 1.3);',
        '   gl_FragColor = texture2D(uSampler, vTextureCoord);',
        '   gl_FragColor.rgb = mix(gl_FragColor.rgb, nightMatrix * gl_FragColor.rgb, opacity);',
        '}',
      ].join('\n');
      const uniforms = { opacity: { type: '1f', value: 1 } };
      super({
        glProgram: new PIXI.GlProgram({ vertex: '', fragment }),
        resources: uniforms,
      });
    }
  }
  LightNightPixiFilter.prototype.constructor = gdjs.LightNightPixiFilter;
  gdjs.PixiFiltersTools.registerFilterCreator(
    'LightNight',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const filter = new gdjs.LightNightPixiFilter();
        return filter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        if (parameterName === 'opacity') {
          filter.resources.opacity = gdjs.PixiFiltersTools.clampValue(
            value,
            0,
            1
          );
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        if (parameterName === 'opacity') {
          return filter.resources.opacity;
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
      getNetworkSyncData(filter: PIXI.Filter): LightNightFilterExtra {
        return {
          o: filter.resources.opacity,
        };
      }
      updateFromNetworkSyncData(
        filter: PIXI.Filter,
        data: LightNightFilterExtra
      ) {
        filter.resources.opacity = data.o;
      }
    })()
  );
}
