namespace gdjs {
  const userFriendlyToHtmlInputTypes = {
    text: 'text',
    email: 'email',
    password: 'password',
    number: 'number',
    'telephone number': 'tel',
    url: 'url',
    search: 'search',
  };

  const formatRgbAndOpacityToCssRgba = (
    rgbColor: [float, float, float],
    opacity: float
  ) => {
    return (
      'rgba(' +
      rgbColor[0] +
      ',' +
      rgbColor[1] +
      ',' +
      rgbColor[2] +
      ',' +
      opacity / 255 +
      ')'
    );
  };

  class TextInputRuntimeObjectPixiRenderer {
    private _object: gdjs.TextInputRuntimeObject;
    private _input: HTMLInputElement | HTMLTextAreaElement | null = null;
    private _runtimeScene: gdjs.RuntimeScene;
    private _runtimeGame: gdjs.RuntimeGame;

    constructor(runtimeObject: gdjs.TextInputRuntimeObject) {
      this._object = runtimeObject;
      this._runtimeScene = runtimeObject.getRuntimeScene();
      this._runtimeGame = this._runtimeScene.getGame();

      this._createElement();
    }

    _createElement() {
      if (!!this._input)
        throw new Error('Tried to recreate an input while it already exists.');

      const isTextArea = this._object.getInputType() === 'text area';
      this._input = document.createElement(isTextArea ? 'textarea' : 'input');
      this._input.style.border = '1px solid black';
      this._input.style.borderRadius = '0px';
      this._input.style.backgroundColor = 'white';
      this._input.style.position = 'absolute';
      this._input.style.resize = 'none';
      this._input.style.outline = 'none';
      this._input.style.pointerEvents = 'auto'; // Element can be clicked/touched.
      this._input.style.display = 'none'; // Hide while object is being set up.

      this._input.addEventListener('input', () => {
        if (!this._input) return;

        this._object.onRendererInputValueChanged(this._input.value);
      });
      this._input.addEventListener('touchstart', () => {
        if (!this._input) return;

        // Focus directly when touching the input on touchscreens.
        if (document.activeElement !== this._input) this._input.focus();
      });

      this.updateString();
      this.updateFont();
      this.updatePlaceholder();
      this.updateOpacity();
      this.updateInputType();
      this.updateTextColor();
      this.updateFillColorAndOpacity();
      this.updateBorderColorAndOpacity();
      this.updateBorderWidth();
      this.updateDisabled();
      this.updateReadOnly();

      this._runtimeGame
        .getRenderer()
        .getDomElementContainer()!
        .appendChild(this._input);
    }

    _destroyElement() {
      if (!this._input) return;
      this._input.remove();
      this._input = null;
    }

    onScenePaused() {
      // This is the only renderer that uses a DOM element. PixiJS renderers
      // usually don't need to know if a scene is paused/resumed,
      // because their renderers are then not used (not part of the other scene graphs).
      // For this object, we need to remove the DOM element whenever it must
      // be not rendered.
      this._destroyElement();
    }

    onSceneResumed() {
      this._createElement();
    }

    onDestroy() {
      this._destroyElement();
    }

    updatePreRender() {
      if (!this._input) return;

      // Hide the input entirely if the object is hidden.
      // Because this object is rendered as a DOM element (and not part of the PixiJS
      // scene graph), we have to do this manually.
      if (this._object.isHidden()) {
        this._input.style.display = 'none';
        return;
      }

      // Hide the input entirely if the layer is not visible.
      // Because this object is rendered as a DOM element (and not part of the PixiJS
      // scene graph), we have to do this manually.
      const layer = this._runtimeScene.getLayer(this._object.getLayer());
      if (!layer.isVisible()) {
        this._input.style.display = 'none';
        return;
      }

      const runtimeGame = this._runtimeScene.getGame();
      const runtimeGameRenderer = runtimeGame.getRenderer();
      const topLeftCanvasCoordinates = layer.convertInverseCoords(
        this._object.x,
        this._object.y,
        0
      );
      const bottomRightCanvasCoordinates = layer.convertInverseCoords(
        this._object.x + this._object.getWidth(),
        this._object.y + this._object.getHeight(),
        0
      );

      // Hide the input entirely if not visible at all.
      const isOutsideCanvas =
        bottomRightCanvasCoordinates[0] < 0 ||
        bottomRightCanvasCoordinates[1] < 0 ||
        topLeftCanvasCoordinates[0] > runtimeGame.getGameResolutionWidth() ||
        topLeftCanvasCoordinates[1] > runtimeGame.getGameResolutionHeight();
      if (isOutsideCanvas) {
        this._input.style.display = 'none';
        return;
      }

      // Position the input on the container on top of the canvas.
      const topLeftPageCoordinates = runtimeGameRenderer.convertCanvasToDomElementContainerCoords(
        topLeftCanvasCoordinates
      );
      const bottomRightPageCoordinates = runtimeGameRenderer.convertCanvasToDomElementContainerCoords(
        bottomRightCanvasCoordinates
      );

      const widthInContainer =
        bottomRightPageCoordinates[0] - topLeftPageCoordinates[0];
      const heightInContainer =
        bottomRightPageCoordinates[1] - topLeftPageCoordinates[1];

      this._input.style.left = topLeftPageCoordinates[0] + 'px';
      this._input.style.top = topLeftPageCoordinates[1] + 'px';
      this._input.style.width = widthInContainer + 'px';
      this._input.style.height = heightInContainer + 'px';
      this._input.style.transform =
        'rotate3d(0,0,1,' + (this._object.getAngle() % 360) + 'deg)';

      // Automatically adjust the font size to follow the game scale.
      this._input.style.fontSize =
        this._object.getFontSize() *
          runtimeGameRenderer.getCanvasToDomElementContainerHeightScale() +
        'px';

      // Display after the object is positioned.
      this._input.style.display = 'initial';
    }

    updateString() {
      if (!this._input) return;
      this._input.value = this._object.getString();
    }

    updatePlaceholder() {
      if (!this._input) return;
      this._input.placeholder = this._object.getPlaceholder();
    }

    updateFont() {
      if (!this._input) return;
      this._input.style.fontFamily = this._runtimeScene
        .getGame()
        .getFontManager()
        .getFontFamily(this._object.getFontResourceName());
    }

    updateOpacity() {
      if (!this._input) return;
      this._input.style.opacity = '' + this._object.getOpacity() / 255;
    }

    updateInputType() {
      if (!this._input) return;

      const isTextArea = this._input instanceof HTMLTextAreaElement;
      const shouldBeTextArea = this._object.getInputType() === 'text area';
      if (isTextArea !== shouldBeTextArea) {
        this._destroyElement();
        this._createElement();
      }

      const newType =
        userFriendlyToHtmlInputTypes[this._object.getInputType()] || 'text';
      this._input.setAttribute('type', newType);
    }

    updateTextColor() {
      if (!this._input) return;

      this._input.style.color = formatRgbAndOpacityToCssRgba(
        this._object._getRawTextColor(),
        255
      );
    }

    updateFillColorAndOpacity() {
      if (!this._input) return;

      this._input.style.backgroundColor = formatRgbAndOpacityToCssRgba(
        this._object._getRawFillColor(),
        this._object.getFillOpacity()
      );
    }

    updateBorderColorAndOpacity() {
      if (!this._input) return;

      this._input.style.borderColor = formatRgbAndOpacityToCssRgba(
        this._object._getRawBorderColor(),
        this._object.getBorderOpacity()
      );
    }
    updateBorderWidth() {
      if (!this._input) return;

      this._input.style.borderWidth = this._object.getBorderWidth() + 'px';
    }
    updateDisabled() {
      if (!this._input) return;

      this._input.disabled = this._object.isDisabled();
    }
    updateReadOnly() {
      if (!this._input) return;

      this._input.readOnly = this._object.isReadOnly();
    }

    isFocused() {
      return this._input === document.activeElement;
    }
  }

  export const TextInputRuntimeObjectRenderer = TextInputRuntimeObjectPixiRenderer;
  export type TextInputRuntimeObjectRenderer = TextInputRuntimeObjectPixiRenderer;
}
