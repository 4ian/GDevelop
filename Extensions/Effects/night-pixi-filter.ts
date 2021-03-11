namespace gdjs {
  export class NightPixiFilter extends PIXI.Filter {
    constructor() {
      const vertexShader = undefined;
      const fragmentShader = [
        'precision mediump float;',
        '',
        'varying vec2 vTextureCoord;',
        'uniform sampler2D uSampler;',
        'uniform float intensity;',
        'uniform float opacity;',
        '',
        'void main(void)',
        '{',
        '   mat3 nightMatrix = mat3(-2.0 * intensity, -1.0 * intensity, 0, -1.0 * intensity, 0, 1.0 * intensity, 0, 1.0 * intensity, 2.0 * intensity);',
        '   gl_FragColor = texture2D(uSampler, vTextureCoord);',
        '   gl_FragColor.rgb = mix(gl_FragColor.rgb, nightMatrix * gl_FragColor.rgb, opacity);',
        '}',
      ].join('\n');
      const uniforms = {
        intensity: { type: '1f', value: 1 },
        opacity: { type: '1f', value: 1 },
      };
      super(vertexShader, fragmentShader, uniforms);
    }
  }
  NightPixiFilter.prototype.constructor = gdjs.NightPixiFilter;
  gdjs.PixiFiltersTools.registerFilterCreator('Night', {
    makePIXIFilter: function (layer, effectData) {
      const filter = new gdjs.NightPixiFilter();
      return filter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName !== 'intensity' && parameterName !== 'opacity') {
        return;
      }
      filter.uniforms[parameterName] = gdjs.PixiFiltersTools.clampValue(
        value,
        0,
        1
      );
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
