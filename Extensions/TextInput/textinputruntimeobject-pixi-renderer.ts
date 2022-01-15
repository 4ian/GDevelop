namespace gdjs {
  class TextInputRuntimeObjectPixiRenderer {
    private _object: gdjs.TextInputRuntimeObject;
    private _input: HTMLInputElement;
    private _runtimeScene: gdjs.RuntimeScene;
    private _runtimeGame: gdjs.RuntimeGame;

    constructor(runtimeObject: gdjs.TextInputRuntimeObject) {
      this._object = runtimeObject;
      this._runtimeScene = runtimeObject.getRuntimeScene();
      this._runtimeGame = this._runtimeScene.getGame();
      this._input = document.createElement('input');
      this._input.style.border = '1px solid black';
      this._input.style.background = 'transparent';

      this._input.addEventListener('input', () => {
        this._object.setValue(this._input.value);
      });
      this._input.style.position = 'absolute';

      this.updateValue();
      this.updateFont();
      document.body.appendChild(this._input);
    }

    onDestroy() {
      const parentElement = this._input.parentElement;
      if (parentElement) parentElement.removeChild(this._input);
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

      // Clamp the area to be inside the game screen.
      if (topLeftCanvasCoordinates[0] < 0) topLeftCanvasCoordinates[0] = 0;
      if (topLeftCanvasCoordinates[1] < 0) topLeftCanvasCoordinates[1] = 0;
      if (
        bottomRightCanvasCoordinates[0] > runtimeGame.getGameResolutionWidth()
      )
        bottomRightCanvasCoordinates[0] = runtimeGame.getGameResolutionWidth();
      if (
        bottomRightCanvasCoordinates[1] > runtimeGame.getGameResolutionHeight()
      )
        bottomRightCanvasCoordinates[1] = runtimeGame.getGameResolutionHeight();

      if (bottomRightCanvasCoordinates[0] < topLeftCanvasCoordinates[0] ||
        bottomRightCanvasCoordinates[1] < topLeftCanvasCoordinates[1]) {
        this._input.style.display = 'none';
        return;
      }
      this._input.style.display = 'initial';

      // Position the input on the HTML page:
      const topLeftPageCoordinates =
        runtimeGameRenderer.convertCanvasToPageCoords(topLeftCanvasCoordinates);
      const bottomRightPageCoordinates =
        runtimeGameRenderer.convertCanvasToPageCoords(
          bottomRightCanvasCoordinates
        );

      const widthInPage =
        bottomRightPageCoordinates[0] - topLeftPageCoordinates[0];
      const heightInPage =
        bottomRightPageCoordinates[1] - topLeftPageCoordinates[1];

      this._input.style.left = topLeftPageCoordinates[0] + 'px';
      this._input.style.top = topLeftPageCoordinates[1] + 'px';
      this._input.style.width = widthInPage + 'px';
      this._input.style.height = heightInPage + 'px';

      // if (this._object.getAutomaticFontSize()) // TODO
      {
        this._input.style.fontSize = heightInPage - 5 + 'px';
      }
    }

    updateValue() {
      this._input.value = this._object.getValue();
    }

    updateFont() {
      this._input.style.fontFamily = this._runtimeScene
        .getGame()
        .getFontManager()
        .getFontFamily(this._object.getFont());
    }
  }

  export const TextInputRuntimeObjectRenderer =
    TextInputRuntimeObjectPixiRenderer;
  export type TextInputRuntimeObjectRenderer =
    TextInputRuntimeObjectPixiRenderer;
}
