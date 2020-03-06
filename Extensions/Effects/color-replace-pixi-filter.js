gdjs.PixiFiltersTools.registerFilterCreator('ColorReplace', {
  makePIXIFilter: function(layer, effectData) {
    var colorReplaceFilter = new PIXI.filters.ColorReplaceFilter([1.0,0,0],[1.0,0.5,1.0],0.001);

    return colorReplaceFilter;
  },
  update: function(filter, layer) {},
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName === 'epsilon') {
      filter.epsilon = value;
    }
  },
  updateStringParameter: function(filter, parameterName, value) {
    if (parameterName === 'originalColor') {
      1+1;//filter.originalColor = value.replace('#', '0x');
    }
    else if (parameterName === 'newColor') {
      2+2;//filter.newColor = value.replace('#', '0x');
    }
  },
  updateBooleanParameter: function(filter, parameterName, value) {},
});
