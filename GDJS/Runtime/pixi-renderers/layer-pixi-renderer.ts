/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;

  /**
   * The renderer for a gdjs.Layer using Pixi.js.
   */
  export class LayerPixiRenderer {
    _pixiContainer: PIXI.Container;

    _layer: gdjs.Layer;
    _renderTexture: PIXI.RenderTexture | null = null;
    _lightingSprite: PIXI.Sprite | null = null;
    _runtimeSceneRenderer: any;
    _pixiRenderer: PIXI.Renderer | null;

    // Width and height are tracked when a render texture is used.
    _oldWidth: float | null = null;
    _oldHeight: float | null = null;
    _isLightingLayer: boolean;
    _clearColor: Array<integer>;

    /**
     * @param layer The layer
     * @param runtimeSceneRenderer The scene renderer
     */
    constructor(
      layer: gdjs.Layer,
      runtimeSceneRenderer: gdjs.RuntimeScenePixiRenderer
    ) {
      this._pixiContainer = new PIXI.Container();
      this._pixiContainer.name = "Layer of " + (layer._runtimeInstancesContainer._name ? layer._runtimeInstancesContainer._name : "Custom");
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

    getRendererObject(): PIXI.Container {
      return this._pixiContainer;
    }

    getLightingSprite(): PIXI.Sprite | null {
      return this._lightingSprite;
    }

    /**
     * Update the position of the PIXI container. To be called after each change
     * made to position, zoom or rotation of the camera.
     */
    updatePosition(): void {
      const angle = -gdjs.toRad(this._layer.getCameraRotation());
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
      this._pixiContainer.position.x = this._layer.getWidth() / 2 - centerX;
      this._pixiContainer.position.y = this._layer.getHeight() / 2 - centerY;

      if (
        this._layer.getRuntimeScene().getGame().getPixelsRounding() &&
        (cosValue === 0 || sinValue === 0) &&
        Number.isInteger(zoomFactor)
      ) {
        // Camera rounding is important for pixel perfect games.
        // Otherwise, the camera position fractional part is added to
        // the sprite one and it changes in which direction sprites are rounded.
        // It makes sprites rounding inconsistent with each other
        // and they seem to move on pixel left and right.
        //
        // PIXI uses a floor function on sprites position on the screen,
        // so a floor must be applied on the camera position too.
        // According to the above calculus,
        // _pixiContainer.position is the opposite of the camera,
        // this is why the ceil function is used floor(x) = -ceil(-x).
        //
        // When the camera directly follows an object,
        // given this object dimension is even,
        // the decimal part of onScenePosition and cameraPosition are the same.
        //
        // Doing the calculus without rounding:
        // onScreenPosition = onScenePosition - cameraPosition
        // onScreenPosition = 980.75 - 200.75
        // onScreenPosition = 780
        //
        // Doing the calculus with rounding:
        // onScreenPosition = floor(onScenePosition + ceil(-cameraPosition))
        // onScreenPosition = floor(980.75 + ceil(-200.75))
        // onScreenPosition = floor(980.75 - 200)
        // onScreenPosition = floor(780.75)
        // onScreenPosition = 780
        this._pixiContainer.position.x = Math.ceil(
          this._pixiContainer.position.x
        );
        this._pixiContainer.position.y = Math.ceil(
          this._pixiContainer.position.y
        );
      }
    }

    updateVisibility(visible: boolean): void {
      this._pixiContainer.visible = !!visible;
    }

    updatePreRender(): void {
      if (this._renderTexture) {
        this._updateRenderTexture();
      }
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
        this._pixiRenderer.type !== PIXI.RENDERER_TYPE.WEBGL
      ) {
        return;
      }
      if (!this._renderTexture) {
        this._oldWidth = this._pixiRenderer.screen.width;
        this._oldHeight = this._pixiRenderer.screen.height;
        const width = this._oldWidth;
        const height = this._oldHeight;
        const resolution = this._pixiRenderer.resolution;
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
      const oldRenderTexture = this._pixiRenderer.renderTexture.current;
      const oldSourceFrame = this._pixiRenderer.renderTexture.sourceFrame;
      this._pixiRenderer.renderTexture.bind(this._renderTexture);
      this._pixiRenderer.renderTexture.clear(this._clearColor);
      this._pixiRenderer.render(
        this._pixiContainer,
        this._renderTexture,
        false
      );
      this._pixiRenderer.renderTexture.bind(
        oldRenderTexture,
        oldSourceFrame,
        undefined
      );
    }

    /**
     * Enable the use of a PIXI.RenderTexture to render the PIXI.Container
     * of the layer and, in the scene PIXI container, replace the container
     * of the layer by a sprite showing this texture.
     * used only in lighting for now as the sprite could have MULTIPLY blend mode.
     */
    private _replaceContainerWithSprite(): void {
      if (
        !this._pixiRenderer ||
        this._pixiRenderer.type !== PIXI.RENDERER_TYPE.WEBGL
      ) {
        return;
      }
      this._updateRenderTexture();
      if (!this._renderTexture) {
        return;
      }
      this._lightingSprite = new PIXI.Sprite(this._renderTexture);
      this._lightingSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
      const sceneContainer = this._runtimeSceneRenderer.getPIXIContainer();
      const index = sceneContainer.getChildIndex(this._pixiContainer);
      sceneContainer.addChildAt(this._lightingSprite, index);
      sceneContainer.removeChild(this._pixiContainer);
    }
  }

  //Register the class to let the engine use it.
  export type LayerRenderer = gdjs.LayerPixiRenderer;
  export const LayerRenderer = gdjs.LayerPixiRenderer;
}
