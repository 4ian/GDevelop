// @ts-check
/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * The renderer for a gdjs.Layer using Pixi.js.
 *
 * @class LayerPixiRenderer
 * @memberof gdjs
 * @param {gdjs.Layer} layer The layer
 * @param {gdjs.RuntimeScenePixiRenderer} runtimeSceneRenderer The scene renderer
 */
gdjs.LayerPixiRenderer = function(layer, runtimeSceneRenderer) {
  // @ts-ignore
  this._pixiContainer = new PIXI.Container();
  /** @type Object.<string, gdjsPixiFiltersToolsFilter> */
  this._filters = {};
  this._layer = layer;
  runtimeSceneRenderer.getPIXIContainer().addChild(this._pixiContainer);

  this._setupFilters();
};

gdjs.LayerRenderer = gdjs.LayerPixiRenderer; //Register the class to let the engine use it.

/**
 * Update the position of the PIXI container. To be called after each change
 * made to position, zoom or rotation of the camera.
 * @private
 */
gdjs.LayerPixiRenderer.prototype.updatePosition = function() {
  var angle = -gdjs.toRad(this._layer.getCameraRotation());
  var zoomFactor = this._layer.getCameraZoom();

  this._pixiContainer.rotation = angle;
  this._pixiContainer.scale.x = zoomFactor;
  this._pixiContainer.scale.y = zoomFactor;

  var cosValue = Math.cos(angle);
  var sinValue = Math.sin(angle);
  var centerX =
    this._layer.getCameraX() * zoomFactor * cosValue -
    this._layer.getCameraY() * zoomFactor * sinValue;
  var centerY =
    this._layer.getCameraX() * zoomFactor * sinValue +
    this._layer.getCameraY() * zoomFactor * cosValue;

  this._pixiContainer.position.x = -centerX;
  this._pixiContainer.position.y = -centerY;
  this._pixiContainer.position.x += this._layer.getWidth() / 2;
  this._pixiContainer.position.y += this._layer.getHeight() / 2;
};

gdjs.LayerPixiRenderer.prototype.updateVisibility = function(visible) {
  this._pixiContainer.visible = !!visible;
};

gdjs.LayerPixiRenderer.prototype.updateTime = function() {
  for(var filterName in this._filters) {
    var filter = this._filters[filterName];
    filter.update(filter.pixiFilter, this._layer);
  }
};

gdjs.LayerPixiRenderer.prototype._setupFilters = function() {
  var effects = this._layer.getEffects();
  if (effects.length === 0) {
    return;
  }

  this._filters = {};

  // @ts-ignore
  /** @type PIXI.Filter[] */
  var pixiFilters = [];
  for (var i = 0; i < effects.length; ++i) {
    var effect = effects[i];
    var filterCreator = gdjs.PixiFiltersTools.getFilterCreator(
      effect.effectType
    );
    if (!filterCreator) {
      console.log(
        'Filter "' +
          effect.name +
          '" has an unknown effect type: "' +
          effect.effectType +
          '". Was it registered properly? Is the effect type correct?'
      );
      continue;
    }

    /** @type gdjsPixiFiltersToolsFilter */
    var filter = {
      pixiFilter: filterCreator.makePIXIFilter(this._layer, effect),
      updateDoubleParameter: filterCreator.updateDoubleParameter,
      updateStringParameter: filterCreator.updateStringParameter,
      updateBooleanParameter: filterCreator.updateBooleanParameter,
      update: filterCreator.update,
    };

    pixiFilters.push(filter.pixiFilter);
    this._filters[effect.name] = filter;
  }

  this._pixiContainer.filters = pixiFilters;
};

/**
 * Add a child to the pixi container associated to the layer.
 * All objects which are on this layer must be children of this container.
 *
 * @param child The child (PIXI object) to be added.
 * @param zOrder The z order of the associated object.
 */
gdjs.LayerPixiRenderer.prototype.addRendererObject = function(child, zOrder) {
  child.zOrder = zOrder; //Extend the pixi object with a z order.

  for (var i = 0, len = this._pixiContainer.children.length; i < len; ++i) {
    if (this._pixiContainer.children[i].zOrder >= zOrder) {
      //TODO : Dichotomic search
      this._pixiContainer.addChildAt(child, i);
      return;
    }
  }
  this._pixiContainer.addChild(child);
};

/**
 * Change the z order of a child associated to an object.
 *
 * @param child The child (PIXI object) to be modified.
 * @param newZOrder The z order of the associated object.
 */
gdjs.LayerPixiRenderer.prototype.changeRendererObjectZOrder = function(
  child,
  newZOrder
) {
  this._pixiContainer.removeChild(child);
  this.addRendererObject(child, newZOrder);
};

/**
 * Remove a child from the internal pixi container.
 * Should be called when an object is deleted or removed from the layer.
 *
 * @param child The child (PIXI object) to be removed.
 */
gdjs.LayerPixiRenderer.prototype.removeRendererObject = function(child) {
  this._pixiContainer.removeChild(child);
};

/**
 * Update the parameter of an effect (with a number).
 * @param {string} name The effect name
 * @param {string} parameterName The parameter name
 * @param {number} value The new value for the parameter
 */
gdjs.LayerPixiRenderer.prototype.setEffectDoubleParameter = function(
  name,
  parameterName,
  value
) {
  var filter = this._filters[name];
  if (!filter) return;

  filter.updateDoubleParameter(filter.pixiFilter, parameterName, value);
};

/**
 * Update the parameter of an effect (with a string).
 * @param {string} name The effect name
 * @param {string} parameterName The parameter name
 * @param {string} value The new value for the parameter
 */
gdjs.LayerPixiRenderer.prototype.setEffectStringParameter = function(
  name,
  parameterName,
  value
) {
  var filter = this._filters[name];
  if (!filter) return;

  filter.updateStringParameter(filter.pixiFilter, parameterName, value);
};

/**
 * Enable or disable the parameter of an effect (boolean).
 * @param {string} name The effect name
 * @param {string} parameterName The parameter name
 * @param {boolean} value The new value for the parameter
 */
gdjs.LayerPixiRenderer.prototype.setEffectBooleanParameter = function(
  name,
  parameterName,
  value
) {
  var filter = this._filters[name];
  if (!filter) return;

  filter.updateBooleanParameter(filter.pixiFilter, parameterName, value);
};

/**
 * Enable an effect.
 * @param {string} name The effect name
 * @param {boolean} value Set to true to enable, false to disable
 */
gdjs.LayerPixiRenderer.prototype.enableEffect = function(name, value) {
  var filter = this._filters[name];
  if (!filter) return;

  gdjs.PixiFiltersTools.enableEffect(filter, value);
};

/**
 * Check if an effect is enabled.
 * @param {string} name The effect name
 * @return {boolean} true if the filter is enabled
 */
gdjs.LayerPixiRenderer.prototype.isEffectEnabled = function(name) {
  var filter = this._filters[name];
  if (!filter) return false;

  return gdjs.PixiFiltersTools.isEffectEnabled(filter);
};
