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
    private _instanceContainer: gdjs.RuntimeInstanceContainer;
    private _runtimeGame: gdjs.RuntimeGame;
    private _form: HTMLFormElement | null = null;

    constructor(
      runtimeObject: gdjs.TextInputRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      this._object = runtimeObject;
      this._instanceContainer = instanceContainer;
      this._runtimeGame = this._instanceContainer.getGame();

      this._createElement();
    }

    _createElement() {
      if (!!this._input)
        throw new Error('Tried to recreate an input while it already exists.');

      this._form = document.createElement('form');

      const isTextArea = this._object.getInputType() === 'text area';
      this._input = document.createElement(isTextArea ? 'textarea' : 'input');

      this._form.style.border = '0px';
      this._form.style.borderRadius = '0px';
      this._form.style.backgroundColor = 'transparent';
      this._form.style.position = 'absolute';
      this._form.style.pointerEvents = 'auto'; // Element can be clicked/touched.
      this._form.style.display = 'none'; // Hide while object is being set up.
      this._form.style.boxSizing = 'border-box';
      this._form.style.textAlign = this._object.getTextAlign();

      this._input.autocomplete = 'off';
      this._input.style.backgroundColor = 'white';
      this._input.style.outline = 'none'; // Remove any style added by the browser to highlight the focused field in a form (:focus & :focus-visible modifiers).
      this._input.style.resize = 'none'; // Prevent user from resizing the input when it's a text area.
      this._input.style.border = '1px solid black';
      this._input.style.boxSizing = 'border-box';
      this._input.style.width = '100%';
      this._input.style.height = '100%';
      this._input.maxLength = this._object.getMaxLength();
      this._input.style.padding = `${this._object
        .getPaddingY()
        .toFixed(2)}px ${this._object.getPaddingX().toFixed(2)}px`;

      this._form.appendChild(this._input);

      this._input.addEventListener('input', () => {
        if (!this._input) return;

        this._object.onRendererInputValueChanged(this._input.value);
      });
      this._input.addEventListener('touchstart', () => {
        if (!this._input) return;

        // Focus directly when touching the input on touchscreens.
        if (document.activeElement !== this._input) this._input.focus();
      });

      this._form.addEventListener('submit', (event) => {
        event.preventDefault();
        this._object.onRendererFormSubmitted();
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
      this.updateTextAlign();
      this.updateMaxLength();
      this.updatePadding();

      this._runtimeGame
        .getRenderer()
        .getDomElementContainer()!
        .appendChild(this._form);
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
      // The input must have been destroyed when the scene was paused,
      // in case it still exists, skip recreation.
      if (!this._input) this._createElement();
    }

    onDestroy() {
      this._destroyElement();
    }

    updatePreRender() {
      if (!this._input || !this._form) return;
      // Hide the input entirely if the object is hidden.
      // Because this object is rendered as a DOM element (and not part of the PixiJS
      // scene graph), we have to do this manually.
      if (this._object.isHidden()) {
        this._form.style.display = 'none';
        return;
      }

      // Hide the input entirely if the layer is not visible.
      // Because this object is rendered as a DOM element (and not part of the PixiJS
      // scene graph), we have to do this manually.
      {
        let instanceContainer = this._instanceContainer;
        let object: gdjs.RuntimeObject = this._object;
        let hasParent = true;
        do {
          const layer = instanceContainer.getLayer(object.getLayer());
          if (!layer.isVisible() || !object.isVisible()) {
            this._form.style.display = 'none';
            return;
          }
          // TODO Declare an interface to move up in the object tree.
          if (
            instanceContainer instanceof
            gdjs.CustomRuntimeObjectInstanceContainer
          ) {
            object = instanceContainer.getOwner();
            instanceContainer = object.getInstanceContainer();
          } else {
            hasParent = false;
          }
        } while (hasParent);
      }

      const workingPoint: FloatPoint = gdjs.staticArray(
        TextInputRuntimeObjectPixiRenderer.prototype.updatePreRender
      ) as FloatPoint;

      const runtimeGame = this._instanceContainer.getGame();
      const runtimeGameRenderer = runtimeGame.getRenderer();
      const layer = this._instanceContainer.getLayer(this._object.getLayer());
      const topLeftCanvasCoordinates = layer.convertInverseCoords(
        this._object.x,
        this._object.y,
        0,
        workingPoint
      );
      const canvasLeft = topLeftCanvasCoordinates[0];
      const canvasTop = topLeftCanvasCoordinates[1];

      const bottomRightCanvasCoordinates = layer.convertInverseCoords(
        this._object.x + this._object.getWidth(),
        this._object.y + this._object.getHeight(),
        0,
        workingPoint
      );
      const canvasRight = bottomRightCanvasCoordinates[0];
      const canvasBottom = bottomRightCanvasCoordinates[1];

      // Hide the input entirely if not visible at all.
      const isOutsideCanvas =
        canvasRight < 0 ||
        canvasBottom < 0 ||
        canvasLeft > runtimeGame.getGameResolutionWidth() ||
        canvasTop > runtimeGame.getGameResolutionHeight();
      if (isOutsideCanvas) {
        this._form.style.display = 'none';
        return;
      }

      // Position the input on the container on top of the canvas.
      workingPoint[0] = canvasLeft;
      workingPoint[1] = canvasTop;
      runtimeGameRenderer.convertCanvasToDomElementContainerCoords(
        workingPoint,
        workingPoint
      );
      const pageLeft = workingPoint[0];
      const pageTop = workingPoint[1];

      workingPoint[0] = canvasRight;
      workingPoint[1] = canvasBottom;
      runtimeGameRenderer.convertCanvasToDomElementContainerCoords(
        workingPoint,
        workingPoint
      );
      const pageRight = workingPoint[0];
      const pageBottom = workingPoint[1];

      const widthInContainer = pageRight - pageLeft;
      const heightInContainer = pageBottom - pageTop;

      this._form.style.left = pageLeft + 'px';
      this._form.style.top = pageTop + 'px';
      this._form.style.width = widthInContainer + 'px';
      this._form.style.height = heightInContainer + 'px';
      this._form.style.transform =
        'rotate3d(0,0,1,' + (this._object.getAngle() % 360) + 'deg)';
      this._form.style.textAlign = this._object.getTextAlign();

      this._input.style.padding = `${this._object
        .getPaddingY()
        .toFixed(2)}px ${this._object.getPaddingX().toFixed(2)}px`;

      // Automatically adjust the font size to follow the game scale.
      this._input.style.fontSize =
        this._object.getFontSize() *
          runtimeGameRenderer.getCanvasToDomElementContainerHeightScale() +
        'px';

      // Display after the object is positioned.
      this._form.style.display = 'initial';
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
      this._input.style.fontFamily = this._instanceContainer
        .getGame()
        .getFontManager()
        .getFontFamily(this._object.getFontResourceName());
    }

    updateOpacity() {
      if (!this._form) return;
      this._form.style.opacity = (this._object.getOpacity() / 255).toFixed(3);
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
      if (!this._form) return;

      this._form.disabled = this._object.isDisabled();
    }
    updateReadOnly() {
      if (!this._form) return;

      this._form.readOnly = this._object.isReadOnly();
    }

    updateMaxLength() {
      const input = this._input;
      if (!input) return;
      if (this._object.getMaxLength() <= 0) {
        input.removeAttribute('maxLength');
        return;
      }
      input.maxLength = this._object.getMaxLength();
    }

    updatePadding() {
      if (!this._input) return;

      this._input.style.padding = `${this._object
        .getPaddingY()
        .toFixed(2)}px ${this._object.getPaddingX().toFixed(2)}px`;
    }

    updateTextAlign() {
      if (!this._input) return;

      const newTextAlign = this._object.getTextAlign();
      this._input.style.textAlign = newTextAlign;
    }

    isFocused() {
      return this._input === document.activeElement;
    }

    focus() {
      if (!this._input) return;

      this._input.focus();
    }
  }
  export const TextInputRuntimeObjectRenderer = TextInputRuntimeObjectPixiRenderer;
  export type TextInputRuntimeObjectRenderer = TextInputRuntimeObjectPixiRenderer;
}
