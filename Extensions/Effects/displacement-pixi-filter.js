gdjs.PixiFiltersTools.registerFilterCreator("Displacement", {
  makePIXIFilter: function() {
    var displacementSprite = new PIXI.Sprite.fromImage(
      "res/displacement_map.png"
    ); //Use a basic image bundle with GD for now, prefer use a customizable file set by user.
    var displacementFilter = new PIXI.filters.DisplacementFilter(
      displacementSprite
    );

    return displacementFilter;
  },

  updateStringParameters: function(filter, parameterName, value) {

    if (filter === "scaleX") {
      filter.scale.x = value;
    }

    if (filter === "scaleY") {
      filter.scale.y = value;
    }
  }
});
