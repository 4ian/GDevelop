import { PixiFiltersTools, RuntimeScenePixiRenderer } from '.';
import type { Layer } from '../../layer';
import { toRad } from '../../gd';
import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { RenderTexture, Renderer } from '@pixi/core';
import { BLEND_MODES, RENDERER_TYPE, SCALE_MODES } from '@pixi/constants';

/**
 * The renderer for a Layer using js.
 */
export class LayerPixiRenderer {
  _pixiContainer: Container;

  _filters: Record<string, PixiFiltersTools.Filter> = {};
  _layer: any;
  _renderTexture: RenderTexture | null = null;
  _lightingSprite: Sprite | null = null;
  _runtimeSceneRenderer: any;
  _pixiRenderer: Renderer | null;

  // Width and height are tracked when a render texture is used.
  _oldWidth: float | null = null;
  _oldHeight: float | null = null;
  _isLightingLayer: boolean;
  _clearColor: Array<integer>;

  /**
   * @param layer The layer
   * @param runtimeSceneRenderer The scene renderer
   */
  constructor(layer: Layer, runtimeSceneRenderer: RuntimeScenePixiRenderer) {
    this._pixiContainer = new Container();
    this._layer = layer;
    this._runtimeSceneRenderer = runtimeSceneRenderer;
    this._pixiRenderer = runtimeSceneRenderer.getPIXIRenderer();
    this._isLightingLayer = layer.isLightingLayer();
    this._clearColor = layer.getClearColor();
    runtimeSceneRenderer.getPIXIContainer().addChild(this._pixiContainer);
    this._pixiContainer.filters = [];
    if (this._isLightingLayer) {
      this._replaceContainerWithSprite();
    }
  }

  getRendererObject(): Container {
    return this._pixiContainer;
  }

  getLightingSprite(): Sprite | null {
    return this._lightingSprite;
  }

  /**
   * Update the position of the PIXI container. To be called after each change
   * made to position, zoom or rotation of the camera.
   */
  updatePosition(): void {
    const angle = -toRad(this._layer.getCameraRotation());
    const zoomFactor = this._layer.getCameraZoom();
    this._pixiContainer.rotation = angle;
    this._pixiContainer.scale.x = zoomFactor;
    this._pixiContainer.scale.y = zoomFactor;
    const cosValue = Math.cos(angle);
    const sinValue = Math.sin(angle);
    const centerX =
      this._layer.getCameraX() * zoomFactor * cosValue -
      this._layer.getCameraY() * zoomFactor * sinValue;
    const centerY =
      this._layer.getCameraX() * zoomFactor * sinValue +
      this._layer.getCameraY() * zoomFactor * cosValue;
    this._pixiContainer.position.x = -centerX;
    this._pixiContainer.position.y = -centerY;
    this._pixiContainer.position.x += this._layer.getWidth() / 2;
    this._pixiContainer.position.y += this._layer.getHeight() / 2;
  }

  updateVisibility(visible: boolean): void {
    this._pixiContainer.visible = !!visible;
  }

  update(): void {
    if (this._renderTexture) {
      this._updateRenderTexture();
    }
    for (const filterName in this._filters) {
      const filter = this._filters[filterName];
      filter.update(filter.pixiFilter, this._layer);
    }
  }

  /**
   * Add a new effect, or replace the one with the same name.
   * @param effectData The data of the effect to add.
   */
  addEffect(effectData: EffectData): void {
    const filterCreator = PixiFiltersTools.getFilterCreator(
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

    const filter: PixiFiltersTools.Filter = {
      pixiFilter: filterCreator.makePIXIFilter(this._layer, effectData),
      updateDoubleParameter: filterCreator.updateDoubleParameter,
      updateStringParameter: filterCreator.updateStringParameter,
      updateBooleanParameter: filterCreator.updateBooleanParameter,
      update: filterCreator.update,
    };
    if (this._isLightingLayer) {
      filter.pixiFilter.blendMode = BLEND_MODES.ADD;
    }
    this._pixiContainer.filters = (this._pixiContainer.filters || []).concat(
      filter.pixiFilter
    );
    this._filters[effectData.name] = filter;
  }

  /**
   * Remove the effect with the specified name
   * @param effectName The name of the effect.
   */
  removeEffect(effectName: string): void {
    const filter = this._filters[effectName];
    if (!filter) {
      return;
    }
    this._pixiContainer.filters = (this._pixiContainer.filters || []).filter(
      function (pixiFilter) {
        return pixiFilter !== filter.pixiFilter;
      }
    );
    delete this._filters[effectName];
  }

  /**
   * Add a child to the pixi container associated to the layer.
   * All objects which are on this layer must be children of this container.
   *
   * @param child The child (PIXI object) to be added.
   * @param zOrder The z order of the associated object.
   */
  addRendererObject(child, zOrder: integer): void {
    child.zOrder = zOrder;

    //Extend the pixi object with a z order.
    for (let i = 0, len = this._pixiContainer.children.length; i < len; ++i) {
      // @ts-ignore - we added a "zOrder" property.
      if (this._pixiContainer.children[i].zOrder >= zOrder) {
        //TODO : Dichotomic search
        this._pixiContainer.addChildAt(child, i);
        return;
      }
    }
    this._pixiContainer.addChild(child);
  }

  /**
   * Change the z order of a child associated to an object.
   *
   * @param child The child (PIXI object) to be modified.
   * @param newZOrder The z order of the associated object.
   */
  changeRendererObjectZOrder(child, newZOrder: integer): void {
    this._pixiContainer.removeChild(child);
    this.addRendererObject(child, newZOrder);
  }

  /**
   * Remove a child from the internal pixi container.
   * Should be called when an object is deleted or removed from the layer.
   *
   * @param child The child (PIXI object) to be removed.
   */
  removeRendererObject(child): void {
    this._pixiContainer.removeChild(child);
  }

  /**
   * Update the parameter of an effect (with a number).
   * @param name The effect name
   * @param parameterName The parameter name
   * @param value The new value for the parameter
   */
  setEffectDoubleParameter(
    name: string,
    parameterName: string,
    value: float
  ): void {
    const filter = this._filters[name];
    if (!filter) {
      return;
    }
    filter.updateDoubleParameter(filter.pixiFilter, parameterName, value);
  }

  /**
   * Update the parameter of an effect (with a string).
   * @param name The effect name
   * @param parameterName The parameter name
   * @param value The new value for the parameter
   */
  setEffectStringParameter(
    name: string,
    parameterName: string,
    value: string
  ): void {
    const filter = this._filters[name];
    if (!filter) {
      return;
    }
    filter.updateStringParameter(filter.pixiFilter, parameterName, value);
  }

  /**
   * Enable or disable the parameter of an effect (boolean).
   * @param name The effect name
   * @param parameterName The parameter name
   * @param value The new value for the parameter
   */
  setEffectBooleanParameter(
    name: string,
    parameterName: string,
    value: boolean
  ): void {
    const filter = this._filters[name];
    if (!filter) {
      return;
    }
    filter.updateBooleanParameter(filter.pixiFilter, parameterName, value);
  }

  /**
   * Check if an effect exists.
   * @param name The effect name
   * @returns True if the effect exists, false otherwise
   */
  hasEffect(name: string): boolean {
    return !!this._filters[name];
  }

  /**
   * Enable an effect.
   * @param name The effect name
   * @param value Set to true to enable, false to disable
   */
  enableEffect(name: string, value: boolean): void {
    const filter = this._filters[name];
    if (!filter) {
      return;
    }
    PixiFiltersTools.enableEffect(filter, value);
  }

  /**
   * Check if an effect is enabled.
   * @param name The effect name
   * @return true if the filter is enabled
   */
  isEffectEnabled(name: string): boolean {
    const filter = this._filters[name];
    if (!filter) {
      return false;
    }
    return PixiFiltersTools.isEffectEnabled(filter);
  }

  updateClearColor(): void {
    this._clearColor = this._layer.getClearColor();
    this._updateRenderTexture();
  }

  /**
   * Updates the render texture, if it exists.
   * Also, render texture is cleared with a specified clear color.
   */
  _updateRenderTexture(): void {
    if (
      !this._pixiRenderer ||
      this._pixiRenderer.type !== RENDERER_TYPE.WEBGL
    ) {
      return;
    }
    if (!this._renderTexture) {
      this._oldWidth = this._pixiRenderer.screen.width;
      this._oldHeight = this._pixiRenderer.screen.height;
      const width = this._oldWidth;
      const height = this._oldHeight;
      const resolution = this._pixiRenderer.resolution;
      this._renderTexture = RenderTexture.create({
        width,
        height,
        resolution,
      });
      this._renderTexture.baseTexture.scaleMode = SCALE_MODES.LINEAR;
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
    const oldRenderTexture = this._pixiRenderer.renderTexture.current;
    const oldSourceFrame = this._pixiRenderer.renderTexture.sourceFrame;
    this._pixiRenderer.renderTexture.bind(this._renderTexture);
    this._pixiRenderer.renderTexture.clear(this._clearColor);
    this._pixiRenderer.render(this._pixiContainer, this._renderTexture, false);
    this._pixiRenderer.renderTexture.bind(
      oldRenderTexture,
      oldSourceFrame,
      undefined
    );
  }

  /**
   * Enable the use of a RenderTexture to render the Container
   * of the layer and, in the scene PIXI container, replace the container
   * of the layer by a sprite showing this texture.
   * used only in lighting for now as the sprite could have MULTIPLY blend mode.
   */
  private _replaceContainerWithSprite(): void {
    if (
      !this._pixiRenderer ||
      this._pixiRenderer.type !== RENDERER_TYPE.WEBGL
    ) {
      return;
    }
    this._updateRenderTexture();
    if (!this._renderTexture) {
      return;
    }
    this._lightingSprite = new Sprite(this._renderTexture);
    this._lightingSprite.blendMode = BLEND_MODES.MULTIPLY;
    const sceneContainer = this._runtimeSceneRenderer.getPIXIContainer();
    const index = sceneContainer.getChildIndex(this._pixiContainer);
    sceneContainer.addChildAt(this._lightingSprite, index);
    sceneContainer.removeChild(this._pixiContainer);
  }
}

//Register the class to let the engine use it.
export type LayerRenderer = LayerPixiRenderer;
export const LayerRenderer = LayerPixiRenderer;
