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
    private _input: HTMLInputElement | HTMLTextAreaElement;
    private _runtimeScene: gdjs.RuntimeScene;
    private _runtimeGame: gdjs.RuntimeGame;

    constructor(runtimeObject: gdjs.TextInputRuntimeObject) {
      this._object = runtimeObject;
      this._runtimeScene = runtimeObject.getRuntimeScene();
      this._runtimeGame = this._runtimeScene.getGame();

      this._input = this._createElement();
      this._runtimeGame
        .getRenderer()
        .getDomElementContainer()!
        .appendChild(this._input);
    }

    _createElement() {
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
        this._object.onRendererInputValueChanged(this._input.value);
      });
      this._input.addEventListener('touchstart', () => {
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

      return this._input;
    }

    _destroyElement() {
      if (!this._input) return;
      this._input.remove();
    }

    onDestroy() {
      this._destroyElement();
    }

    updatePreRender() {
      const layer = this._runtimeScene.getLayer(this._object.getLayer());
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

      // Hide the input entirely if not visible at all
      const isOutsideCanvas =
        bottomRightCanvasCoordinates[0] < 0 ||
        bottomRightCanvasCoordinates[1] < 0 ||
        topLeftCanvasCoordinates[0] > runtimeGame.getGameResolutionWidth() ||
        topLeftCanvasCoordinates[1] > runtimeGame.getGameResolutionHeight();
      if (isOutsideCanvas) {
        this._input.style.display = 'none';
        return;
      }

      // Position the input on the container on top of the canvas
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
      this._input.value = this._object.getString();
    }

    updatePlaceholder() {
      this._input.placeholder = this._object.getPlaceholder();
    }

    updateFont() {
      this._input.style.fontFamily = this._runtimeScene
        .getGame()
        .getFontManager()
        .getFontFamily(this._object.getFontResourceName());
    }

    updateOpacity() {
      this._input.style.opacity = '' + this._object.getOpacity() / 255;
    }

    updateInputType() {
      const isTextArea = this._input instanceof HTMLTextAreaElement;
      const shouldBeTextArea = this._object.getInputType() === 'text area';
      if (isTextArea !== shouldBeTextArea) {
        this._destroyElement();
        this._createElement();

        this._runtimeGame
          .getRenderer()
          .getDomElementContainer()!
          .appendChild(this._input);
      }

      const newType =
        userFriendlyToHtmlInputTypes[this._object.getInputType()] || 'text';
      this._input.setAttribute('type', newType);
    }

    updateTextColor() {
      this._input.style.color = formatRgbAndOpacityToCssRgba(
        this._object._getRawTextColor(),
        255
      );
    }

    updateFillColorAndOpacity() {
      this._input.style.backgroundColor = formatRgbAndOpacityToCssRgba(
        this._object._getRawFillColor(),
        this._object.getFillOpacity()
      );
    }

    updateBorderColorAndOpacity() {
      this._input.style.borderColor = formatRgbAndOpacityToCssRgba(
        this._object._getRawBorderColor(),
        this._object.getBorderOpacity()
      );
    }
    updateBorderWidth() {
      this._input.style.borderWidth = this._object.getBorderWidth() + 'px';
    }

    isFocused() {
      return this._input === document.activeElement;
    }
  }

  export const TextInputRuntimeObjectRenderer = TextInputRuntimeObjectPixiRenderer;
  export type TextInputRuntimeObjectRenderer = TextInputRuntimeObjectPixiRenderer;
}
