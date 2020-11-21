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
gdjs.LayerPixiRenderer = function (layer, runtimeSceneRenderer) {
  this._pixiContainer = new PIXI.Container();
  /** @type Object.<string, gdjsPixiFiltersToolsFilter> */
  this._filters = {};
  this._layer = layer;

  /** @type {?PIXI.RenderTexture} */
  this._renderTexture = null;

  /** @type {?PIXI.Sprite} */
  this._lightingSprite = null;

  this._runtimeSceneRenderer = runtimeSceneRenderer;
  this._pixiRenderer = runtimeSceneRenderer.getPIXIRenderer();
  // Width and height are tracked when a render texture is used.
  this._oldWidth = null;
  this._oldHeight = null;
  this._isLightingLayer = layer.isLightingLayer();
  this._clearColor = layer.getClearColor();

  runtimeSceneRenderer.getPIXIContainer().addChild(this._pixiContainer);
  this._pixiContainer.filters = [];

  if (this._isLightingLayer) {
    this._replaceContainerWithSprite();
  }
};

gdjs.LayerRenderer = gdjs.LayerPixiRenderer; //Register the class to let the engine use it.

gdjs.LayerPixiRenderer.prototype.getRendererObject = function () {
  return this._pixiContainer;
};

gdjs.LayerPixiRenderer.prototype.getLightingSprite = function () {
  return this._lightingSprite;
};

/**
 * Update the position of the PIXI container. To be called after each change
 * made to position, zoom or rotation of the camera.
 * @private
 */
gdjs.LayerPixiRenderer.prototype.updatePosition = function () {
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

gdjs.LayerPixiRenderer.prototype.updateVisibility = function (visible) {
  this._pixiContainer.visible = !!visible;
};

gdjs.LayerPixiRenderer.prototype.update = function () {
  if (this._renderTexture) {
    this._updateRenderTexture();
  }

  for (var filterName in this._filters) {
    var filter = this._filters[filterName];
    filter.update(filter.pixiFilter, this._layer);
  }
};

/**
 * Add a new effect, or replace the one with the same name.
 * @param {EffectData} effectData The data of the effect to add.
 */
gdjs.LayerPixiRenderer.prototype.addEffect = function (effectData) {
  var filterCreator = gdjs.PixiFiltersTools.getFilterCreator(
    effectData.effectType
  );
  if (!filterCreator) {
    console.log(
      'Filter "' +
        effectData.name +
        '" has an unknown effect type: "' +
        effectData.effectType +
        '". Was it registered properly? Is the effect type correct?'
    );
    return;
  }

  /** @type gdjsPixiFiltersToolsFilter */
  var filter = {
    pixiFilter: filterCreator.makePIXIFilter(this._layer, effectData),
    updateDoubleParameter: filterCreator.updateDoubleParameter,
    updateStringParameter: filterCreator.updateStringParameter,
    updateBooleanParameter: filterCreator.updateBooleanParameter,
    update: filterCreator.update,
  };

  if (this._isLightingLayer) filter.pixiFilter.blendMode = PIXI.BLEND_MODES.ADD;
  this._pixiContainer.filters = (this._pixiContainer.filters || []).concat(
    filter.pixiFilter
  );
  this._filters[effectData.name] = filter;
};

/**
 * Remove the effect with the specified name
 * @param {string} effectName The name of the effect.
 */
gdjs.LayerPixiRenderer.prototype.removeEffect = function (effectName) {
  var filter = this._filters[effectName];
  if (!filter) return;

  this._pixiContainer.filters = (this._pixiContainer.filters || []).filter(
    function (pixiFilter) {
      return pixiFilter !== filter.pixiFilter;
    }
  );
  delete this._filters[effectName];
};

/**
 * Add a child to the pixi container associated to the layer.
 * All objects which are on this layer must be children of this container.
 *
 * @param child The child (PIXI object) to be added.
 * @param zOrder The z order of the associated object.
 */
gdjs.LayerPixiRenderer.prototype.addRendererObject = function (child, zOrder) {
  child.zOrder = zOrder; //Extend the pixi object with a z order.

  for (var i = 0, len = this._pixiContainer.children.length; i < len; ++i) {
    // @ts-ignore
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
gdjs.LayerPixiRenderer.prototype.changeRendererObjectZOrder = function (
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
gdjs.LayerPixiRenderer.prototype.removeRendererObject = function (child) {
  this._pixiContainer.removeChild(child);
};

/**
 * Update the parameter of an effect (with a number).
 * @param {string} name The effect name
 * @param {string} parameterName The parameter name
 * @param {number} value The new value for the parameter
 */
gdjs.LayerPixiRenderer.prototype.setEffectDoubleParameter = function (
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
gdjs.LayerPixiRenderer.prototype.setEffectStringParameter = function (
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
gdjs.LayerPixiRenderer.prototype.setEffectBooleanParameter = function (
  name,
  parameterName,
  value
) {
  var filter = this._filters[name];
  if (!filter) return;

  filter.updateBooleanParameter(filter.pixiFilter, parameterName, value);
};

/**
 * Check if an effect exists.
 * @param {string} name The effect name
 * @returns {boolean} True if the effect exists, false otherwise
 */
gdjs.LayerPixiRenderer.prototype.hasEffect = function (name) {
  return !!this._filters[name];
};

/**
 * Enable an effect.
 * @param {string} name The effect name
 * @param {boolean} value Set to true to enable, false to disable
 */
gdjs.LayerPixiRenderer.prototype.enableEffect = function (name, value) {
  var filter = this._filters[name];
  if (!filter) return;

  gdjs.PixiFiltersTools.enableEffect(filter, value);
};

/**
 * Check if an effect is enabled.
 * @param {string} name The effect name
 * @return {boolean} true if the filter is enabled
 */
gdjs.LayerPixiRenderer.prototype.isEffectEnabled = function (name) {
  var filter = this._filters[name];
  if (!filter) return false;

  return gdjs.PixiFiltersTools.isEffectEnabled(filter);
};

gdjs.LayerPixiRenderer.prototype.updateClearColor = function () {
  this._clearColor = this._layer.getClearColor();
  this._updateRenderTexture();
};

/**
 * Updates the render texture, if it exists.
 * Also, render texture is cleared with a specified clear color.
 */
gdjs.LayerPixiRenderer.prototype._updateRenderTexture = function () {
  if (!this._pixiRenderer || this._pixiRenderer.type !== PIXI.RENDERER_TYPE.WEBGL) return;

  if (!this._renderTexture) {
    this._oldWidth = this._pixiRenderer.screen.width;
    this._oldHeight = this._pixiRenderer.screen.height;

    var width = this._oldWidth;
    var height = this._oldHeight;
    var resolution = this._pixiRenderer.resolution;
    this._renderTexture = PIXI.RenderTexture.create({
      width,
      height,
      resolution,
    });
    this._renderTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
  }

  if (
    this._oldWidth !== this._pixiRenderer.screen.width ||
    this._oldHeight !== this._pixiRenderer.screen.height
  ) {
    this._renderTexture.resize(
      this._pixiRenderer.screen.width,
      this._pixiRenderer.screen.height
    );
    this._oldWidth = this._pixiRenderer.screen.width;
    this._oldHeight = this._pixiRenderer.screen.height;
  }

  var oldRenderTexture = this._pixiRenderer.renderTexture.current;
  var oldSourceFrame = this._pixiRenderer.renderTexture.sourceFrame;

  this._pixiRenderer.renderTexture.bind(this._renderTexture);
  this._pixiRenderer.renderTexture.clear(this._clearColor);

  this._pixiRenderer.render(this._pixiContainer, this._renderTexture, false);
  this._pixiRenderer.renderTexture.bind(
    oldRenderTexture,
    oldSourceFrame,
    undefined
  );
};

/**
 * Enable the use of a PIXI.RenderTexture to render the PIXI.Container
 * of the layer and, in the scene PIXI container, replace the container
 * of the layer by a sprite showing this texture.
 * @private used only in lighting for now as the sprite could have MULTIPLY blend mode.
 */
gdjs.LayerPixiRenderer.prototype._replaceContainerWithSprite = function () {
  if (!this._pixiRenderer || this._pixiRenderer.type !== PIXI.RENDERER_TYPE.WEBGL) return;

  this._updateRenderTexture();
  if (!this._renderTexture) return;
  this._lightingSprite = new PIXI.Sprite(this._renderTexture);
  this._lightingSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;

  var sceneContainer = this._runtimeSceneRenderer.getPIXIContainer();
  var index = sceneContainer.getChildIndex(this._pixiContainer);
  sceneContainer.addChildAt(this._lightingSprite, index);
  sceneContainer.removeChild(this._pixiContainer);
};
