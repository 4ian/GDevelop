gdjs.NightPixiFilter = function() {
  var vertexShader = null;
  var fragmentShader = [
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
  var uniforms = {
    intensity: { type: '1f', value: 1 },
    opacity: { type: '1f', value: 1 },
  };

  PIXI.Filter.call(this, vertexShader, fragmentShader, uniforms);
};

gdjs.NightPixiFilter.prototype = Object.create(PIXI.Filter.prototype);
gdjs.NightPixiFilter.prototype.constructor = gdjs.NightPixiFilter;

gdjs.PixiFiltersTools.registerFilterCreator('Night', {
  makePIXIFilter: function(layer, effectData) {
    var filter = new gdjs.NightPixiFilter();
    return filter;
  },
  update: function(filter, layer) {},
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName !== 'intensity' && parameterName !== 'opacity') return;

    filter.uniforms[parameterName] = gdjs.PixiFiltersTools.clampValue(
      value,
      0,
      1
    );
  },
  updateStringParameter: function(filter, parameterName, value) {},
  updateBooleanParameter: function(filter, parameterName, value) {},
});
