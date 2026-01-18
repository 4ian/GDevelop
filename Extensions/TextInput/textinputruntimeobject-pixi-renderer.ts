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

  const solveLinearSystem = (
    matrix: number[][],
    vector: number[]
  ): number[] | null => {
    const size = vector.length;
    for (let i = 0; i < size; i++) {
      let maxRow = i;
      let maxValue = Math.abs(matrix[i][i]);
      for (let row = i + 1; row < size; row++) {
        const value = Math.abs(matrix[row][i]);
        if (value > maxValue) {
          maxValue = value;
          maxRow = row;
        }
      }
      if (maxValue < 1e-12) {
        return null;
      }

      if (maxRow !== i) {
        const rowTmp = matrix[i];
        matrix[i] = matrix[maxRow];
        matrix[maxRow] = rowTmp;
        const valueTmp = vector[i];
        vector[i] = vector[maxRow];
        vector[maxRow] = valueTmp;
      }

      const pivot = matrix[i][i];
      for (let col = i; col < size; col++) {
        matrix[i][col] /= pivot;
      }
      vector[i] /= pivot;

      for (let row = 0; row < size; row++) {
        if (row === i) continue;
        const factor = matrix[row][i];
        if (factor === 0) continue;
        for (let col = i; col < size; col++) {
          matrix[row][col] -= factor * matrix[i][col];
        }
        vector[row] -= factor * vector[i];
      }
    }
    return vector;
  };

  const computeHomographyMatrix = (
    source: FloatPoint[],
    destination: FloatPoint[]
  ): number[] | null => {
    if (source.length !== 4 || destination.length !== 4) return null;
    const matrix: number[][] = new Array(8);
    const vector: number[] = new Array(8);

    for (let i = 0; i < 4; i++) {
      const x = source[i][0];
      const y = source[i][1];
      const X = destination[i][0];
      const Y = destination[i][1];

      const row = i * 2;
      matrix[row] = [x, y, 1, 0, 0, 0, -x * X, -y * X];
      vector[row] = X;
      matrix[row + 1] = [0, 0, 0, x, y, 1, -x * Y, -y * Y];
      vector[row + 1] = Y;
    }

    const solution = solveLinearSystem(matrix, vector);
    if (!solution) return null;
    return [
      solution[0],
      solution[1],
      solution[2],
      solution[3],
      solution[4],
      solution[5],
      solution[6],
      solution[7],
    ];
  };

  const buildCssMatrix3d = (homography: number[]): string | null => {
    if (homography.length !== 8) return null;
    const h11 = homography[0];
    const h12 = homography[1];
    const h13 = homography[2];
    const h21 = homography[3];
    const h22 = homography[4];
    const h23 = homography[5];
    const h31 = homography[6];
    const h32 = homography[7];

    const values = [
      h11,
      h21,
      0,
      h31,
      h12,
      h22,
      0,
      h32,
      0,
      0,
      1,
      0,
      h13,
      h23,
      0,
      1,
    ];

    for (const value of values) {
      if (!Number.isFinite(value)) return null;
    }

    return `matrix3d(${values
      .map((value) => value.toFixed(6))
      .join(',')})`;
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
      this._input.style.borderRadius = '0px'; // Remove any style added by the browser (Safari adds some radius for instance).
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
      this.updateSpellCheck();
      this.updateTextAlign();
      this.updateMaxLength();
      this.updatePadding();

      this._runtimeGame
        .getRenderer()
        .getDomElementContainer()!
        .appendChild(this._form);
    }

    _destroyElement() {
      if (this._form) {
        this._form.remove();
        this._form = null;
      }
      if (this._input) {
        this._input.remove();
        this._input = null;
      }
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

      const runtimeGame = this._instanceContainer.getGame();
      const runtimeGameRenderer = runtimeGame.getRenderer();
      const layer = this._instanceContainer.getLayer(this._object.getLayer());
      const layerRenderer = layer.getRenderer();

      const objectWidth = this._object.getWidth();
      const objectHeight = this._object.getHeight();

      let use3DProjection = false;
      let projectedCanvasPoints: FloatPoint[] | null = null;
      if (objectWidth > 0 && objectHeight > 0) {
        const objectAngle =
          gdjs.toRad(this._object.getAngle() % 360) || 0;
        const cosAngle = Math.cos(objectAngle);
        const sinAngle = Math.sin(objectAngle);
        const centerX = this._object.x + objectWidth / 2;
        const centerY = this._object.y + objectHeight / 2;
        const cornerOffsets: FloatPoint[] = [
          [-objectWidth / 2, -objectHeight / 2],
          [objectWidth / 2, -objectHeight / 2],
          [objectWidth / 2, objectHeight / 2],
          [-objectWidth / 2, objectHeight / 2],
        ];
        const projectedPoint: FloatPoint = [0, 0];
        const projected: FloatPoint[] = [];
        use3DProjection = true;
        for (let i = 0; i < cornerOffsets.length; i++) {
          const offsetX = cornerOffsets[i][0];
          const offsetY = cornerOffsets[i][1];
          const rotatedX = centerX + offsetX * cosAngle - offsetY * sinAngle;
          const rotatedY = centerY + offsetX * sinAngle + offsetY * cosAngle;
          const projectedResult = layerRenderer.projectLayerPointToCanvas(
            rotatedX,
            rotatedY,
            projectedPoint
          );
          if (
            !projectedResult ||
            !Number.isFinite(projectedResult[0]) ||
            !Number.isFinite(projectedResult[1])
          ) {
            use3DProjection = false;
            break;
          }
          projected.push([projectedResult[0], projectedResult[1]]);
        }
        if (use3DProjection) {
          projectedCanvasPoints = projected;
        }
      }

      if (!use3DProjection || !projectedCanvasPoints) {
        const workingPoint: FloatPoint = gdjs.staticArray(
          TextInputRuntimeObjectPixiRenderer.prototype.updatePreRender
        ) as FloatPoint;
        const topLeftCanvasCoordinates = layer.convertInverseCoords(
          this._object.x,
          this._object.y,
          0,
          workingPoint
        );
        const canvasLeft = topLeftCanvasCoordinates[0];
        const canvasTop = topLeftCanvasCoordinates[1];

        const bottomRightCanvasCoordinates = layer.convertInverseCoords(
          this._object.x + objectWidth,
          this._object.y + objectHeight,
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
        this._form.style.transformOrigin = 'center center';
        this._form.style.transform =
          'rotate3d(0,0,1,' + (this._object.getAngle() % 360) + 'deg)';
      } else {
        const gameWidth = runtimeGame.getGameResolutionWidth();
        const gameHeight = runtimeGame.getGameResolutionHeight();
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (let i = 0; i < projectedCanvasPoints.length; i++) {
          const point = projectedCanvasPoints[i];
          minX = Math.min(minX, point[0]);
          minY = Math.min(minY, point[1]);
          maxX = Math.max(maxX, point[0]);
          maxY = Math.max(maxY, point[1]);
        }

        const isOutsideCanvas =
          maxX < 0 ||
          maxY < 0 ||
          minX > gameWidth ||
          minY > gameHeight;
        if (isOutsideCanvas) {
          this._form.style.display = 'none';
          return;
        }

        const projectedDomPoints: FloatPoint[] = [];
        for (let i = 0; i < projectedCanvasPoints.length; i++) {
          const domPoint: FloatPoint = [
            projectedCanvasPoints[i][0],
            projectedCanvasPoints[i][1],
          ];
          runtimeGameRenderer.convertCanvasToDomElementContainerCoords(
            domPoint,
            domPoint
          );
          projectedDomPoints.push(domPoint);
        }

        const domOrigin: FloatPoint = [0, 0];
        runtimeGameRenderer.convertCanvasToDomElementContainerCoords(
          domOrigin,
          domOrigin
        );
        const domUnitX: FloatPoint = [1, 0];
        runtimeGameRenderer.convertCanvasToDomElementContainerCoords(
          domUnitX,
          domUnitX
        );
        const domUnitY: FloatPoint = [0, 1];
        runtimeGameRenderer.convertCanvasToDomElementContainerCoords(
          domUnitY,
          domUnitY
        );

        const scaleX = domUnitX[0] - domOrigin[0];
        const scaleY = domUnitY[1] - domOrigin[1];
        if (
          !Number.isFinite(scaleX) ||
          !Number.isFinite(scaleY) ||
          scaleX === 0 ||
          scaleY === 0
        ) {
          this._form.style.display = 'none';
          return;
        }

        const widthInContainer = objectWidth * scaleX;
        const heightInContainer = objectHeight * scaleY;
        if (
          !Number.isFinite(widthInContainer) ||
          !Number.isFinite(heightInContainer) ||
          widthInContainer === 0 ||
          heightInContainer === 0
        ) {
          this._form.style.display = 'none';
          return;
        }

        const sourcePoints: FloatPoint[] = [
          [0, 0],
          [widthInContainer, 0],
          [widthInContainer, heightInContainer],
          [0, heightInContainer],
        ];

        const homography = computeHomographyMatrix(
          sourcePoints,
          projectedDomPoints
        );
        const cssMatrix = homography ? buildCssMatrix3d(homography) : null;

        if (cssMatrix) {
          this._form.style.left = '0px';
          this._form.style.top = '0px';
          this._form.style.width = widthInContainer + 'px';
          this._form.style.height = heightInContainer + 'px';
          this._form.style.transformOrigin = '0 0';
          this._form.style.transform = cssMatrix;
        } else {
          const edgeTopX = projectedDomPoints[1][0] - projectedDomPoints[0][0];
          const edgeTopY = projectedDomPoints[1][1] - projectedDomPoints[0][1];
          const edgeLeftX = projectedDomPoints[3][0] - projectedDomPoints[0][0];
          const edgeLeftY = projectedDomPoints[3][1] - projectedDomPoints[0][1];
          const fallbackWidth = Math.hypot(edgeTopX, edgeTopY);
          const fallbackHeight = Math.hypot(edgeLeftX, edgeLeftY);
          if (
            !Number.isFinite(fallbackWidth) ||
            !Number.isFinite(fallbackHeight) ||
            fallbackWidth === 0 ||
            fallbackHeight === 0
          ) {
            this._form.style.display = 'none';
            return;
          }
          const angleDeg = (Math.atan2(edgeTopY, edgeTopX) * 180) / Math.PI;
          this._form.style.left = projectedDomPoints[0][0] + 'px';
          this._form.style.top = projectedDomPoints[0][1] + 'px';
          this._form.style.width = fallbackWidth + 'px';
          this._form.style.height = fallbackHeight + 'px';
          this._form.style.transformOrigin = '0 0';
          this._form.style.transform = `rotate3d(0,0,1,${angleDeg}deg)`;
        }
      }
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
      if (!this._input) return;

      this._input.disabled = this._object.isDisabled();
    }
    updateReadOnly() {
      if (!this._input) return;

      this._input.readOnly = this._object.isReadOnly();
    }

    updateSpellCheck() {
      if (!this._input) return;

      this._input.spellcheck = this._object.isSpellCheckEnabled();
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
  /** @category Renderers > Text Input */
  export const TextInputRuntimeObjectRenderer =
    TextInputRuntimeObjectPixiRenderer;
  /** @category Renderers > Text Input */
  export type TextInputRuntimeObjectRenderer =
    TextInputRuntimeObjectPixiRenderer;
}
