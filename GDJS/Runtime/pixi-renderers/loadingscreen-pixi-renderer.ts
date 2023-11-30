namespace gdjs {
  enum LoadingScreenState {
    NOT_STARTED,
    STARTED,
    FINISHED,
  }

  const fadeIn = (
    object: { alpha: number } | null,
    duration: float,
    deltaTimeInMs: float
  ) => {
    if (!object) return;
    if (duration > 0) {
      object.alpha += ((1 / duration) * deltaTimeInMs) / 1000;
      if (object.alpha > 1) object.alpha = 1;
    } else {
      object.alpha = 1;
    }
  };
  const hasFadedIn = (object: PIXI.DisplayObject | null) => {
    return !object || object.alpha >= 1;
  };

  class LoadingScreenPixiRenderer {
    _pixiRenderer: PIXI.Renderer | null;
    _loadingScreenData: LoadingScreenData;
    _isFirstLayout: boolean;

    _loadingScreenContainer: PIXI.Container;
    _backgroundSprite: PIXI.Sprite | null = null;
    _gdevelopLogoSprite: PIXI.Sprite | null = null;
    _progressBarGraphics: PIXI.Graphics | null = null;

    _state: LoadingScreenState = LoadingScreenState.NOT_STARTED;
    _startTimeInMs: float = 0;
    _backgroundReadyTimeInMs: float = 0;
    _lastFrameTimeInMs: float = 0;
    _progressPercent: float = 0;

    constructor(
      runtimeGamePixiRenderer: gdjs.RuntimeGamePixiRenderer,
      imageManager: gdjs.PixiImageManager,
      loadingScreenData: LoadingScreenData,
      isFirstScene: boolean
    ) {
      this._loadingScreenData = loadingScreenData;
      this._isFirstLayout = isFirstScene;
      this._loadingScreenContainer = new PIXI.Container();
      this._pixiRenderer = runtimeGamePixiRenderer.getPIXIRenderer();
      if (!this._pixiRenderer) {
        // A PIXI Renderer can be missing during tests, when creating a runtime game
        // without a canvas.
        return;
      }
      this._pixiRenderer.background.color = this._loadingScreenData.backgroundColor;
      this._pixiRenderer.background.alpha = 0;

      const backgroundTexture = imageManager.getOrLoadPIXITexture(
        loadingScreenData.backgroundImageResourceName
      );
      if (backgroundTexture !== imageManager.getInvalidPIXITexture()) {
        this._backgroundSprite = PIXI.Sprite.from(backgroundTexture);
        this._backgroundSprite.alpha = 0;
        this._backgroundSprite.anchor.x = 0.5;
        this._backgroundSprite.anchor.y = 0.5;
        this._loadingScreenContainer.addChild(this._backgroundSprite);
      }

      if (loadingScreenData.showGDevelopSplash && isFirstScene) {
        this._gdevelopLogoSprite = PIXI.Sprite.from(gdjs.gdevelopLogo);
        this._gdevelopLogoSprite.alpha = 0;
        this._gdevelopLogoSprite.anchor.x = 0.5;
        this._gdevelopLogoSprite.anchor.y = 0.5;
        this._loadingScreenContainer.addChild(this._gdevelopLogoSprite);
      }
      if (loadingScreenData.showProgressBar) {
        this._progressBarGraphics = new PIXI.Graphics();
        this._progressBarGraphics.alpha = 0;
        this._loadingScreenContainer.addChild(this._progressBarGraphics);
      }

      this._render(performance.now());
    }

    setPercent(percent: number) {
      this._progressPercent = percent;
    }

    private _startLoadingScreen() {
      if (!this._pixiRenderer) return;
      this._state = LoadingScreenState.STARTED;
      this._startTimeInMs = performance.now();
    }

    private _updatePositions() {
      if (!this._pixiRenderer) return;

      if (this._backgroundSprite && this._backgroundSprite.texture.valid) {
        this._backgroundSprite.position.x = this._pixiRenderer.width / 2;
        this._backgroundSprite.position.y = this._pixiRenderer.height / 2;
        const scale = Math.max(
          this._pixiRenderer.width / this._backgroundSprite.texture.width,
          this._pixiRenderer.height / this._backgroundSprite.texture.height
        );
        this._backgroundSprite.scale.x = scale;
        this._backgroundSprite.scale.y = scale;
      }

      if (this._gdevelopLogoSprite) {
        this._gdevelopLogoSprite.position.x = this._pixiRenderer.width / 2;
        this._gdevelopLogoSprite.position.y = this._pixiRenderer.height / 2;
        const logoWidth = 680;
        const border =
          this._pixiRenderer.width > this._pixiRenderer.height &&
          this._pixiRenderer.width > 500
            ? 150
            : 35;
        const desiredWidth = Math.min(
          logoWidth,
          Math.max(1, this._pixiRenderer.width - border * 2)
        );
        const scale = desiredWidth / logoWidth;
        this._gdevelopLogoSprite.scale.x = scale;
        this._gdevelopLogoSprite.scale.y = scale;

        // Give up trying to show the logo if the resolution is really too small.
        // TODO: use a low resolution logo instead.
        this._gdevelopLogoSprite.visible =
          this._pixiRenderer.width > 200 && this._pixiRenderer.height > 200;
      }
    }

    private _render(timeInMs: float) {
      if (!this._pixiRenderer) {
        return;
      }

      // Continue the rendering loop as long as the loading screen is not finished.
      if (this._state !== LoadingScreenState.FINISHED) {
        requestAnimationFrame(() => this._render(performance.now()));
      }

      this._renderIfNeeded(timeInMs);
    }

    renderIfNeeded(): boolean {
      return this._renderIfNeeded(performance.now());
    }

    private _renderIfNeeded(timeInMs: float): boolean {
      if (timeInMs - this._lastFrameTimeInMs < 1000 / 60) {
        return false;
      }

      if (!this._pixiRenderer) {
        return false;
      }

      const deltaTimeInMs = this._lastFrameTimeInMs
        ? timeInMs - this._lastFrameTimeInMs
        : 0;
      this._lastFrameTimeInMs = timeInMs;

      this._updatePositions();

      if (this._state == LoadingScreenState.NOT_STARTED) {
        if (!this._backgroundSprite || this._backgroundSprite.texture.valid) {
          this._startLoadingScreen();
        }
      } else if (this._state == LoadingScreenState.STARTED) {
        const backgroundFadeInDuration = this._loadingScreenData
          .backgroundFadeInDuration;

        this._pixiRenderer.clear();
        fadeIn(
          this._pixiRenderer.background,
          backgroundFadeInDuration,
          deltaTimeInMs
        );
        fadeIn(this._backgroundSprite, backgroundFadeInDuration, deltaTimeInMs);

        if (hasFadedIn(this._backgroundSprite)) {
          if (!this._backgroundReadyTimeInMs)
            this._backgroundReadyTimeInMs = timeInMs;

          const logoAndProgressFadeInDuration = this._loadingScreenData
            .logoAndProgressFadeInDuration;
          const logoAndProgressLogoFadeInDelay = this._loadingScreenData
            .logoAndProgressLogoFadeInDelay;

          if (
            timeInMs - this._backgroundReadyTimeInMs >
            logoAndProgressLogoFadeInDelay * 1000
          ) {
            fadeIn(
              this._gdevelopLogoSprite,
              logoAndProgressFadeInDuration,
              deltaTimeInMs
            );
            fadeIn(
              this._progressBarGraphics,
              logoAndProgressFadeInDuration,
              deltaTimeInMs
            );
          }
        }

        if (this._progressBarGraphics) {
          const color = this._loadingScreenData.progressBarColor;
          let progressBarWidth =
            (this._loadingScreenData.progressBarWidthPercent / 100) *
            this._pixiRenderer.width;
          if (this._loadingScreenData.progressBarMaxWidth > 0) {
            if (progressBarWidth > this._loadingScreenData.progressBarMaxWidth)
              progressBarWidth = this._loadingScreenData.progressBarMaxWidth;
          }
          if (this._loadingScreenData.progressBarMinWidth > 0) {
            if (progressBarWidth < this._loadingScreenData.progressBarMinWidth)
              progressBarWidth = this._loadingScreenData.progressBarMinWidth;
          }

          const progressBarHeight = this._loadingScreenData.progressBarHeight;
          const progressBarX = Math.floor(
            this._pixiRenderer.width / 2 - progressBarWidth / 2
          );
          const progressBarY =
            this._pixiRenderer.height < 350
              ? Math.floor(this._pixiRenderer.height - 10 - progressBarHeight)
              : Math.floor(this._pixiRenderer.height - 90 - progressBarHeight);
          const lineWidth = 1;
          // Display bar with an additional 1% to ensure it's filled at the end.
          const progress = Math.min(1, (this._progressPercent + 1) / 100);
          this._progressBarGraphics.clear();
          this._progressBarGraphics.lineStyle(lineWidth, color, 1, 0);
          this._progressBarGraphics.drawRect(
            progressBarX,
            progressBarY,
            progressBarWidth,
            progressBarHeight
          );

          this._progressBarGraphics.beginFill(color, 1);
          this._progressBarGraphics.lineStyle(0, color, 1);
          this._progressBarGraphics.drawRect(
            progressBarX + lineWidth,
            progressBarY + lineWidth,
            progressBarWidth * progress - lineWidth * 2,
            progressBarHeight - lineWidth * 2
          );
          this._progressBarGraphics.endFill();
        }
      } else if (this._state === LoadingScreenState.FINISHED) {
        // Display a black screen to avoid a stretched image of the loading
        // screen to appear.
        this._pixiRenderer.background.color = 'black';
        this._pixiRenderer.background.alpha = 1;
        this._pixiRenderer.clear();
        this._loadingScreenContainer.removeChildren();
      }

      this._pixiRenderer.render(this._loadingScreenContainer);
      return true;
    }

    unload(): Promise<void> {
      const totalElapsedTime = (performance.now() - this._startTimeInMs) / 1000;
      const remainingTime =
        (this._isFirstLayout ? this._loadingScreenData.minDuration : 0) -
        totalElapsedTime;
      this.setPercent(100);

      // Ensure we have shown the loading screen for at least minDuration.
      if (remainingTime <= 0) {
        this._state = LoadingScreenState.FINISHED;
        return Promise.resolve();
      }
      return new Promise((resolve) =>
        setTimeout(() => {
          this._state = LoadingScreenState.FINISHED;
          resolve();
        }, remainingTime * 1000)
      );
    }
  }

  //Register the class to let the engine use it.
  export const LoadingScreenRenderer = LoadingScreenPixiRenderer;
}
