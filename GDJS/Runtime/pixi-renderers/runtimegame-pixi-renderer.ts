namespace gdjs {
  const logger = new gdjs.Logger('PIXI game renderer');

  /**
   * Codes (as in `event.code`) of keys that should have their event `preventDefault`
   * called. This is used to avoid scrolling in a webpage when these keys are pressed
   * in the game.
   */
  const defaultPreventedKeyCodes = [
    37, // ArrowLeft
    38, // ArrowUp
    39, // ArrowRight
    40, // ArrowDown
  ];

  /**
   * The renderer for a gdjs.RuntimeGame using Pixi.js.
   */
  export class RuntimeGamePixiRenderer {
    _game: gdjs.RuntimeGame;
    _isFullPage: boolean = true;

    //Used to track if the canvas is displayed on the full page.
    _isFullscreen: boolean = false;

    //Used to track if the window is displayed as fullscreen (see setFullscreen method).
    _forceFullscreen: any;

    _pixiRenderer: PIXI.Renderer | null = null;
    private _threeRenderer: THREE.WebGLRenderer | null = null;
    private _gameCanvas: HTMLCanvasElement | null = null;
    private _domElementsContainer: HTMLDivElement | null = null;

    // Current width of the canvas (might be scaled down/up compared to renderer)
    _canvasWidth: float = 0;
    // Current height of the canvas (might be scaled down/up compared to renderer)
    _canvasHeight: float = 0;

    _keepRatio: boolean = true;
    _marginLeft: any;
    _marginTop: any;
    _marginRight: any;
    _marginBottom: any;

    _nextFrameId: integer = 0;

    _wasDisposed: boolean = false;

    /**
     * @param game The game that is being rendered
     * @param forceFullscreen If fullscreen should be always activated
     */
    constructor(game: gdjs.RuntimeGame, forceFullscreen: boolean) {
      this._game = game;
      this._forceFullscreen = forceFullscreen;

      //If set to true, the canvas will always be displayed as fullscreen, even if _isFullscreen == false.
      this._marginLeft = this._marginTop = this._marginRight = this._marginBottom = 0;
      this._setupOrientation();
    }

    /**
     * Create the canvas on which the game will be rendered, inside the specified DOM element, and
     * setup the rendering of the game.
     * If you want to use your own canvas, use `initializeRenderers` and `initializeCanvas` instead.
     *
     * @param parentElement The parent element to which the canvas will be added.
     */
    createStandardCanvas(parentElement: HTMLElement) {
      this._throwIfDisposed();

      const gameCanvas = document.createElement('canvas');
      parentElement.appendChild(gameCanvas);

      this.initializeRenderers(gameCanvas);
      this.initializeCanvas(gameCanvas);
    }

    /**
     * Set up the rendering of the game for the given canvas.
     *
     * In most cases, you can use `createStandardCanvas` instead to initialize the game.
     */
    initializeRenderers(gameCanvas: HTMLCanvasElement): void {
      this._throwIfDisposed();

      if (typeof THREE !== 'undefined') {
        this._threeRenderer = new THREE.WebGLRenderer({
          canvas: gameCanvas,
          antialias:
            this._game.getAntialiasingMode() !== 'none' &&
            (this._game.isAntialisingEnabledOnMobile() ||
              !gdjs.evtTools.common.isMobile()),
          preserveDrawingBuffer: true, // Keep to true to allow screenshots.
        });
        this._threeRenderer.useLegacyLights = true;
        this._threeRenderer.autoClear = false;
        this._threeRenderer.setSize(
          this._game.getGameResolutionWidth(),
          this._game.getGameResolutionHeight()
        );

        // Create a PixiJS renderer that use the same GL context as Three.js
        // so that both can render to the canvas and even have PixiJS rendering
        // reused in Three.js (by using a RenderTexture and the same internal WebGL texture).
        this._pixiRenderer = new PIXI.Renderer({
          width: this._game.getGameResolutionWidth(),
          height: this._game.getGameResolutionHeight(),
          view: gameCanvas,
          // @ts-ignore - reuse the context from Three.js.
          context: this._threeRenderer.getContext(),
          clearBeforeRender: false,
          preserveDrawingBuffer: true, // Keep to true to allow screenshots.
          antialias: false,
          backgroundAlpha: 0,
          // TODO (3D): add a setting for pixel ratio (`resolution: window.devicePixelRatio`)
        });
      } else {
        // Create the renderer and setup the rendering area.
        // "preserveDrawingBuffer: true" is needed to avoid flickering
        // and background issues on some mobile phones (see #585 #572 #566 #463).
        this._pixiRenderer = PIXI.autoDetectRenderer({
          width: this._game.getGameResolutionWidth(),
          height: this._game.getGameResolutionHeight(),
          view: gameCanvas,
          preserveDrawingBuffer: true,
          antialias: false,
        }) as PIXI.Renderer;
      }

      // Deactivating accessibility support in PixiJS renderer, as we want to be in control of this.
      // See https://github.com/pixijs/pixijs/issues/5111#issuecomment-420047824
      this._pixiRenderer.plugins.accessibility.destroy();
      delete this._pixiRenderer.plugins.accessibility;
    }

    /**
     * Set up the game canvas so that it covers the size required by the game
     * and has a container for DOM elements required by the game.
     */
    initializeCanvas(gameCanvas: HTMLCanvasElement): void {
      // Add the renderer view element to the DOM
      this._gameCanvas = gameCanvas;

      gameCanvas.style.position = 'absolute';

      // Ensure that the canvas has the focus.
      gameCanvas.tabIndex = 1;

      // Ensure long press can't create a selection
      gameCanvas.style.userSelect = 'none';
      gameCanvas.style.outline = 'none'; // No selection/focus ring on the canvas.

      // Set up the container for HTML elements on top of the game canvas.
      const domElementsContainer = document.createElement('div');
      domElementsContainer.style.position = 'absolute';
      domElementsContainer.style.overflow = 'hidden'; // Never show anything outside the container.
      domElementsContainer.style.outline = 'none'; // No selection/focus ring on this container.
      domElementsContainer.style.pointerEvents = 'none'; // Clicks go through the container.

      // The container should *never* scroll.
      // Elements are put inside with the same coordinates (with a scaling factor)
      // as on the game canvas.
      domElementsContainer.addEventListener('scroll', (event) => {
        domElementsContainer.scrollLeft = 0;
        domElementsContainer.scrollTop = 0;
        event.preventDefault();
      });

      // When clicking outside an input, (or other HTML element),
      // give back focus to the game canvas so that this element is blurred.
      gameCanvas.addEventListener('pointerdown', () => {
        gameCanvas.focus();
      });

      // Prevent magnifying glass on iOS with a long press.
      // Note that there are related bugs on iOS 15 (see https://bugs.webkit.org/show_bug.cgi?id=231161)
      // but it seems not to affect us as the `domElementsContainer` has `pointerEvents` set to `none`.
      domElementsContainer.style['-webkit-user-select'] = 'none';

      gameCanvas.parentNode?.appendChild(domElementsContainer);
      this._domElementsContainer = domElementsContainer;

      this._resizeCanvas();

      // Handle scale mode.
      if (this._game.getScaleMode() === 'nearest') {
        gameCanvas.style['image-rendering'] = '-moz-crisp-edges';
        gameCanvas.style['image-rendering'] = '-webkit-optimize-contrast';
        gameCanvas.style['image-rendering'] = '-webkit-crisp-edges';
        gameCanvas.style['image-rendering'] = 'pixelated';
      }

      // Handle pixels rounding.
      if (this._game.getPixelsRounding()) {
        PIXI.settings.ROUND_PIXELS = true;
      }

      // Handle resize: immediately adjust the game canvas (and dom element container)
      // and notify the game (that may want to adjust to the new size of the window).
      window.addEventListener('resize', () => {
        this._game.onWindowInnerSizeChanged();
        this._resizeCanvas();
      });

      // Focus the canvas when created.
      gameCanvas.focus();
    }

    static getWindowInnerWidth() {
      return typeof window !== 'undefined' ? window.innerWidth : 800;
    }

    static getWindowInnerHeight() {
      return typeof window !== 'undefined' ? window.innerHeight : 800;
    }

    /**
     * Update the game renderer size according to the "game resolution".
     * Called when game resolution changes.
     *
     * Note that if the canvas is fullscreen, it won't be resized, but when going back to
     * non fullscreen mode, the requested size will be used.
     */
    updateRendererSize(): void {
      this._resizeCanvas();
    }

    /**
     * Set the proper screen orientation from the project properties.
     */
    private _setupOrientation() {
      if (
        typeof window === 'undefined' ||
        !window.screen ||
        !window.screen.orientation
      ) {
        return;
      }
      const gameOrientation = this._game.getGameData().properties.orientation;
      try {
        // We ignore the error as some platforms may not supporting locking (i.e: desktop).
        if (gameOrientation === 'default') {
          const promise = window.screen.orientation.unlock();
          // @ts-ignore
          if (promise) {
            // @ts-ignore
            promise.catch(() => {});
          }
        } else {
          // @ts-ignore
          window.screen.orientation.lock(gameOrientation).catch(() => {});
        }
      } catch (error) {
        logger.error('Unexpected error while setting up orientation: ', error);
      }
    }

    /**
     * Resize the renderer (the "game resolution") and the canvas (which can be larger
     * or smaller to fill the page, with optional margins).
     *
     */
    private _resizeCanvas() {
      if (!this._pixiRenderer || !this._domElementsContainer) return;

      // Set the Pixi (and/or Three) renderer size to the game size.
      // There is no "smart" resizing to be done here: the rendering of the game
      // should be done with the size set on the game.
      if (
        this._pixiRenderer.width !== this._game.getGameResolutionWidth() ||
        this._pixiRenderer.height !== this._game.getGameResolutionHeight()
      ) {
        // TODO (3D): It might be useful to resize pixi view in 3D depending on FOV value
        // to enable a mode where pixi always fills the whole screen.
        this._pixiRenderer.resize(
          this._game.getGameResolutionWidth(),
          this._game.getGameResolutionHeight()
        );

        if (this._threeRenderer) {
          this._threeRenderer.setSize(
            this._game.getGameResolutionWidth(),
            this._game.getGameResolutionHeight()
          );
        }
      }

      // Set the canvas size.
      // Resizing is done according to the settings. This is a "CSS" resize
      // only, so won't create visual artifacts during the rendering.
      const isFullPage =
        this._forceFullscreen || this._isFullPage || this._isFullscreen;
      let canvasWidth = this._game.getGameResolutionWidth();
      let canvasHeight = this._game.getGameResolutionHeight();
      let maxWidth = window.innerWidth - this._marginLeft - this._marginRight;
      let maxHeight = window.innerHeight - this._marginTop - this._marginBottom;
      if (maxWidth < 0) {
        maxWidth = 0;
      }
      if (maxHeight < 0) {
        maxHeight = 0;
      }
      if (isFullPage && !this._keepRatio) {
        canvasWidth = maxWidth;
        canvasHeight = maxHeight;
      } else if (
        (isFullPage && this._keepRatio) ||
        canvasWidth > maxWidth ||
        canvasHeight > maxHeight
      ) {
        let factor = maxWidth / canvasWidth;
        if (canvasHeight * factor > maxHeight) {
          factor = maxHeight / canvasHeight;
        }
        canvasWidth *= factor;
        canvasHeight *= factor;
      }

      // Apply the calculations to the canvas element...
      if (this._gameCanvas) {
        this._gameCanvas.style.top =
          this._marginTop + (maxHeight - canvasHeight) / 2 + 'px';
        this._gameCanvas.style.left =
          this._marginLeft + (maxWidth - canvasWidth) / 2 + 'px';
        this._gameCanvas.style.width = canvasWidth + 'px';
        this._gameCanvas.style.height = canvasHeight + 'px';
      }

      // ...and to the div on top of it showing DOM elements (like inputs).
      this._domElementsContainer.style.top =
        this._marginTop + (maxHeight - canvasHeight) / 2 + 'px';
      this._domElementsContainer.style.left =
        this._marginLeft + (maxWidth - canvasWidth) / 2 + 'px';
      this._domElementsContainer.style.width = canvasWidth + 'px';
      this._domElementsContainer.style.height = canvasHeight + 'px';

      // Store the canvas size for fast access to it.
      this._canvasWidth = canvasWidth;
      this._canvasHeight = canvasHeight;
    }

    /**
     * Set if the aspect ratio must be kept when the game canvas is resized to fill
     * the page.
     */
    keepAspectRatio(enable) {
      if (this._keepRatio === enable) {
        return;
      }
      this._keepRatio = enable;
      this._resizeCanvas();
    }

    /**
     * Change the margin that must be preserved around the game canvas.
     */
    setMargins(top, right, bottom, left): void {
      this._throwIfDisposed();
      if (
        this._marginTop === top &&
        this._marginRight === right &&
        this._marginBottom === bottom &&
        this._marginLeft === left
      ) {
        return;
      }
      this._marginTop = top;
      this._marginRight = right;
      this._marginBottom = bottom;
      this._marginLeft = left;
      this._resizeCanvas();
    }

    /**
     * Update the window size, if possible.
     * @param width The new width, in pixels.
     * @param height The new height, in pixels.
     */
    setWindowSize(width: float, height: float): void {
      this._throwIfDisposed();
      const remote = this.getElectronRemote();
      if (remote) {
        const browserWindow = remote.getCurrentWindow();
        try {
          if (browserWindow) {
            browserWindow.setContentSize(width, height);
          }
        } catch (error) {
          logger.error(
            `Window size setting to width ${width} and height ${height} failed. See error:`,
            error
          );
        }
      } else {
        logger.warn("Window size can't be changed on this platform.");
      }
    }

    /**
     * Center the window on screen.
     */
    centerWindow() {
      this._throwIfDisposed();
      const remote = this.getElectronRemote();
      if (remote) {
        const browserWindow = remote.getCurrentWindow();
        try {
          if (browserWindow) {
            browserWindow.center();
          }
        } catch (error) {
          logger.error('Window centering failed. See error:', error);
        }
      } else {
        logger.warn("Window can't be centered on this platform.");
      }
    }

    /**
     * De/activate fullscreen for the game.
     */
    setFullScreen(enable): void {
      this._throwIfDisposed();
      if (this._forceFullscreen) {
        return;
      }
      if (this._isFullscreen !== enable) {
        this._isFullscreen = !!enable;
        const remote = this.getElectronRemote();
        if (remote) {
          const browserWindow = remote.getCurrentWindow();
          try {
            if (browserWindow) {
              browserWindow.setFullScreen(this._isFullscreen);
            }
          } catch (error) {
            logger.error(
              `Full screen setting to ${this._isFullscreen} failed. See error:`,
              error
            );
          }
        } else {
          // Use HTML5 Fullscreen API
          //TODO: Do this on a user gesture, otherwise most browsers won't activate fullscreen
          if (this._isFullscreen) {
            // @ts-ignore
            if (document.documentElement.requestFullscreen) {
              // @ts-ignore
              document.documentElement.requestFullscreen();
            } else {
              // @ts-ignore
              if (document.documentElement.mozRequestFullScreen) {
                // @ts-ignore
                document.documentElement.mozRequestFullScreen();
              } else {
                // @ts-ignore
                if (document.documentElement.webkitRequestFullScreen) {
                  // @ts-ignore
                  document.documentElement.webkitRequestFullScreen();
                }
              }
            }
          } else {
            // @ts-ignore
            if (document.exitFullscreen) {
              // @ts-ignore
              document.exitFullscreen();
            } else {
              // @ts-ignore
              if (document.mozCancelFullScreen) {
                // @ts-ignore
                document.mozCancelFullScreen();
              } else {
                // @ts-ignore
                if (document.webkitCancelFullScreen) {
                  // @ts-ignore
                  document.webkitCancelFullScreen();
                }
              }
            }
          }
        }
        this._resizeCanvas();
      }
    }

    /**
     * Checks if the game is in full screen.
     */
    isFullScreen(): boolean {
      const remote = this.getElectronRemote();
      if (remote) {
        try {
          return remote.getCurrentWindow().isFullScreen();
        } catch (error) {
          logger.error(`Full screen detection failed. See error:`, error);
          return false;
        }
      }

      // Height check is used to detect user triggered full screen (for example F11 shortcut).
      return this._isFullscreen || window.screen.height === window.innerHeight;
    }

    /**
     * Convert a point from the canvas coordinates to the dom element container coordinates.
     *
     * @param canvasCoords The point in the canvas coordinates.
     * @param result The point to return.
     * @returns The point in the dom element container coordinates.
     */
    convertCanvasToDomElementContainerCoords(
      canvasCoords: FloatPoint,
      result: FloatPoint
    ): FloatPoint {
      const pageCoords = result || [0, 0];

      // Handle the fact that the game is stretched to fill the canvas.
      pageCoords[0] =
        (canvasCoords[0] * this._canvasWidth) /
        this._game.getGameResolutionWidth();
      pageCoords[1] =
        (canvasCoords[1] * this._canvasHeight) /
        this._game.getGameResolutionHeight();

      return pageCoords;
    }

    /**
     * Return the scale factor between the renderer height and the actual canvas height,
     * which is also the height of the container for DOM elements to be superimposed on top of it.
     *
     * Useful to scale font sizes of DOM elements so that they follow the size of the game.
     */
    getCanvasToDomElementContainerHeightScale(): float {
      return (this._canvasHeight || 1) / this._game.getGameResolutionHeight();
    }

    /**
     * Add the standard events handler.
     *
     * The game canvas must have been initialized before calling this.
     */
    bindStandardEvents(
      manager: gdjs.InputManager,
      window: Window,
      document: Document
    ) {
      this._throwIfDisposed();
      const canvas = this._gameCanvas;
      if (!canvas) return;

      //Translate an event (mouse or touch) made on the canvas on the page
      //to game coordinates.
      const getEventPosition = (e: MouseEvent | Touch) => {
        const pos = [e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop];

        // Handle the fact that the game is stretched to fill the canvas.
        pos[0] *=
          this._game.getGameResolutionWidth() / (this._canvasWidth || 1);
        pos[1] *=
          this._game.getGameResolutionHeight() / (this._canvasHeight || 1);
        return pos;
      };

      const isInsideCanvas = (e: MouseEvent | Touch) => {
        const x = e.pageX - canvas.offsetLeft;
        const y = e.pageY - canvas.offsetTop;

        return (
          0 <= x &&
          x < (this._canvasWidth || 1) &&
          0 <= y &&
          y < (this._canvasHeight || 1)
        );
      };

      //Some browsers lacks definition of some variables used to do calculations
      //in getEventPosition. They are defined to 0 as they are useless.

      (function ensureOffsetsExistence() {
        if (isNaN(canvas.offsetLeft)) {
          // @ts-ignore
          canvas.offsetLeft = 0;
          // @ts-ignore
          canvas.offsetTop = 0;
        }
        if (isNaN(document.body.scrollLeft)) {
          document.body.scrollLeft = 0;
          document.body.scrollTop = 0;
        }
        if (
          document.documentElement === undefined ||
          document.documentElement === null
        ) {
          // @ts-ignore
          document.documentElement = {};
        }
        if (isNaN(document.documentElement.scrollLeft)) {
          document.documentElement.scrollLeft = 0;
          document.documentElement.scrollTop = 0;
        }
        if (isNaN(canvas.offsetLeft)) {
          // @ts-ignore
          canvas.offsetLeft = 0;
          // @ts-ignore
          canvas.offsetTop = 0;
        }
      })();

      // Keyboard: listen at the document level to capture even when the canvas
      // is not focused.

      const isFocusingDomElement = () => {
        // Fast bailout when the game canvas should receive the inputs (i.e: almost always).
        // Also check the document body or null for activeElement, as all of these should go
        // to the game.
        if (
          document.activeElement === canvas ||
          document.activeElement === document.body ||
          document.activeElement === null
        )
          return false;

        return true;
      };
      const isTargetDomElement = (event: TouchEvent) => {
        // Fast bailout when the game canvas should receive the inputs (i.e: almost always).
        // Any event with a target that is not the body or the canvas should
        // not go to the game (<input> or <a> elements for instances).
        if (event.target === canvas || event.target === document.body)
          return false;
        return true;
      };
      document.onkeydown = function (e) {
        if (isFocusingDomElement()) {
          // Bail out if the game canvas is not focused. For example,
          // an `<input>` element can be focused, and needs to receive
          // arrow keys events.
          return;
        }

        if (defaultPreventedKeyCodes.includes(e.keyCode)) {
          // Some keys are "default prevented" to avoid scrolling when the game
          // is integrated in a page as an iframe.
          e.preventDefault();
        }

        manager.onKeyPressed(e.keyCode, e.location);
      };
      document.onkeyup = function (e) {
        if (isFocusingDomElement()) {
          // Bail out if the game canvas is not focused. For example,
          // an `<input>` element can be focused, and needs to receive
          // arrow keys events.
          return;
        }

        if (defaultPreventedKeyCodes.includes(e.keyCode)) {
          // Some keys are "default prevented" to avoid scrolling when the game
          // is integrated in a page as an iframe.
          e.preventDefault();
        }

        manager.onKeyReleased(e.keyCode, e.location);
      };

      // Mouse:

      // Converts HTML mouse button to InputManager mouse button.
      // This function is used to align HTML button values with GDevelop 3 C++ SFML Mouse button enum values,
      // notably the middle and right buttons.
      function convertHtmlMouseButtonToInputManagerMouseButton(button: number) {
        switch (button) {
          case 1: // Middle button
            return gdjs.InputManager.MOUSE_MIDDLE_BUTTON;
          case 2: // Right button
            return gdjs.InputManager.MOUSE_RIGHT_BUTTON;
        }
        return button;
      }
      canvas.onmousemove = function (e) {
        const pos = getEventPosition(e);
        manager.onMouseMove(pos[0], pos[1]);
      };
      canvas.onmousedown = function (e) {
        manager.onMouseButtonPressed(
          convertHtmlMouseButtonToInputManagerMouseButton(e.button)
        );
        if (window.focus !== undefined) {
          window.focus();
        }
        return false;
      };
      canvas.onmouseup = function (e) {
        manager.onMouseButtonReleased(
          convertHtmlMouseButtonToInputManagerMouseButton(e.button)
        );
        return false;
      };
      canvas.onmouseleave = function (e) {
        manager.onMouseLeave();
      };
      canvas.onmouseenter = function (e) {
        manager.onMouseEnter();
        // There is no mouse event when the cursor is outside of the canvas.
        // We catchup what happened.
        const buttons = [
          gdjs.InputManager.MOUSE_LEFT_BUTTON,
          gdjs.InputManager.MOUSE_RIGHT_BUTTON,
          gdjs.InputManager.MOUSE_MIDDLE_BUTTON,
          gdjs.InputManager.MOUSE_BACK_BUTTON,
          gdjs.InputManager.MOUSE_FORWARD_BUTTON,
        ];
        for (let i = 0, len = buttons.length; i < len; ++i) {
          const button = buttons[i];
          const buttonIsPressed = (e.buttons & (1 << i)) !== 0;
          const buttonWasPressed = manager.isMouseButtonPressed(button);
          if (buttonIsPressed && !buttonWasPressed) {
            manager.onMouseButtonPressed(button);
          } else if (!buttonIsPressed && buttonWasPressed) {
            manager.onMouseButtonReleased(button);
          }
        }
      };
      window.addEventListener(
        'click',
        function (e) {
          if (window.focus !== undefined) {
            window.focus();
          }
          return false;
        },
        false
      );
      canvas.oncontextmenu = function (event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      };
      // @ts-ignore
      canvas.onwheel = function (event) {
        manager.onMouseWheel(-event.deltaY);
      };

      // Touches:
      window.addEventListener(
        'touchmove',
        function (e) {
          if (isTargetDomElement(e)) {
            // Bail out if the game canvas is not focused. For example,
            // an `<input>` element can be focused, and needs to receive
            // touch events to move the selection (and do other native gestures).
            return;
          }

          e.preventDefault();
          if (e.changedTouches) {
            for (let i = 0; i < e.changedTouches.length; ++i) {
              const pos = getEventPosition(e.changedTouches[i]);
              manager.onTouchMove(
                e.changedTouches[i].identifier,
                pos[0],
                pos[1]
              );
              // This works because touch events are sent
              // when they continue outside of the canvas.
              if (manager.isSimulatingMouseWithTouch()) {
                if (isInsideCanvas(e.changedTouches[i])) {
                  manager.onMouseEnter();
                } else {
                  manager.onMouseLeave();
                }
              }
            }
          }
        },
        // This is important so that we can use e.preventDefault() and block possible following mouse events.
        { passive: false }
      );
      window.addEventListener(
        'touchstart',
        function (e) {
          if (isTargetDomElement(e)) {
            // Bail out if the game canvas is not focused. For example,
            // an `<input>` element can be focused, and needs to receive
            // touch events to move the selection (and do other native gestures).
            return;
          }

          e.preventDefault();
          if (e.changedTouches) {
            for (let i = 0; i < e.changedTouches.length; ++i) {
              const pos = getEventPosition(e.changedTouches[i]);
              manager.onTouchStart(
                e.changedTouches[i].identifier,
                pos[0],
                pos[1]
              );
            }
          }
          return false;
        },
        // This is important so that we can use e.preventDefault() and block possible following mouse events.
        { passive: false }
      );
      window.addEventListener(
        'touchend',
        function (e) {
          if (isTargetDomElement(e)) {
            // Bail out if the game canvas is not focused. For example,
            // an `<input>` element can be focused, and needs to receive
            // touch events to move the selection (and do other native gestures).
            return;
          }

          e.preventDefault();
          if (e.changedTouches) {
            for (let i = 0; i < e.changedTouches.length; ++i) {
              manager.onTouchEnd(e.changedTouches[i].identifier);
            }
          }
          return false;
        },
        // This is important so that we can use e.preventDefault() and block possible following mouse events.
        { passive: false }
      );
      window.addEventListener(
        'touchcancel',
        function (e) {
          if (isTargetDomElement(e)) {
            // Bail out if the game canvas is not focused. For example,
            // an `<input>` element can be focused, and needs to receive
            // touch events to move the selection (and do other native gestures).
            return;
          }

          e.preventDefault();
          if (e.changedTouches) {
            for (let i = 0; i < e.changedTouches.length; ++i) {
              manager.onTouchCancel(e.changedTouches[i].identifier);
            }
          }
          return false;
        },
        // This is important so that we can use e.preventDefault() and block possible following mouse events.
        { passive: false }
      );
    }

    setWindowTitle(title): void {
      if (typeof document !== 'undefined') {
        document.title = title;
      }
    }

    getWindowTitle() {
      return typeof document !== 'undefined' ? document.title : '';
    }

    startGameLoop(fn) {
      this._throwIfDisposed();
      let oldTime = 0;
      const gameLoop = (time: float) => {
        // Schedule the next frame now to be sure it's called as soon
        // as possible after this one is finished.
        this._nextFrameId = requestAnimationFrame(gameLoop);

        const dt = oldTime ? time - oldTime : 0;
        oldTime = time;
        if (!fn(dt)) {
          // Stop the game loop if requested.
          cancelAnimationFrame(this._nextFrameId);
        }
      };

      requestAnimationFrame(gameLoop);
    }

    stopGameLoop(): void {
      cancelAnimationFrame(this._nextFrameId);
    }

    getPIXIRenderer() {
      return this._pixiRenderer;
    }

    /**
     * Get the Three.js renderer for the game - if any.
     */
    getThreeRenderer(): THREE.WebGLRenderer | null {
      return this._threeRenderer;
    }

    /**
     * Get the DOM element used as a container for HTML elements to display
     * on top of the game.
     */
    getDomElementContainer() {
      return this._domElementsContainer;
    }

    /**
     * Open the given URL in the system browser (or a new tab)
     */
    openURL(url: string) {
      // Try to detect the environment to use the most adapted
      // way of opening an URL.

      if (typeof window !== 'undefined') {
        const electron = this.getElectron();
        if (electron) {
          electron.shell.openExternal(url);
        } else if (
          // @ts-ignore
          typeof window.cordova !== 'undefined' &&
          // @ts-ignore
          typeof window.cordova.InAppBrowser !== 'undefined'
        ) {
          // @ts-ignore
          window.cordova.InAppBrowser.open(url, '_system', 'location=yes');
        } else {
          window.open(url, '_blank');
        }
      }
    }

    /**
     * Close the game, if applicable.
     */
    stopGame() {
      // Try to detect the environment to use the most adapted
      // way of closing the app
      const remote = this.getElectronRemote();
      if (remote) {
        const browserWindow = remote.getCurrentWindow();
        if (browserWindow) {
          try {
            browserWindow.close();
          } catch (error) {
            logger.error('Window closing failed. See error:', error);
          }
        }
      } else {
        if (
          typeof navigator !== 'undefined' &&
          // @ts-ignore
          navigator.app &&
          // @ts-ignore
          navigator.app.exitApp
        ) {
          // @ts-ignore
          navigator.app.exitApp();
        }
      }
      // HTML5 games on mobile/browsers don't have a way to close their window/page.
    }

    /**
     * Dispose the renderers (PixiJS and/or Three.js) as well as DOM elements
     * used for the game (the canvas, if specified, and the additional DOM container
     * created on top of it to allow display HTML elements, for example for text inputs).
     *
     * @param removeCanvas If true, the canvas will be removed from the DOM.
     */
    dispose(removeCanvas?: boolean) {
      this._pixiRenderer?.destroy();
      this._threeRenderer?.dispose();
      this._pixiRenderer = null;
      this._threeRenderer = null;

      if (removeCanvas && this._gameCanvas) {
        this._gameCanvas.parentNode?.removeChild(this._gameCanvas);
      }

      this._gameCanvas = null;
      this._domElementsContainer?.parentNode?.removeChild(
        this._domElementsContainer
      );
      this._domElementsContainer = null;
      this._wasDisposed = true;
    }

    /**
     * Get the canvas DOM element.
     */
    getCanvas(): HTMLCanvasElement | null {
      return this._gameCanvas;
    }

    /**
     * Check if the device supports WebGL.
     * @returns true if WebGL is supported
     */
    isWebGLSupported(): boolean {
      return (
        !!this._pixiRenderer &&
        this._pixiRenderer.type === PIXI.RENDERER_TYPE.WEBGL
      );
    }

    /**
     * Get the electron module, if running as a electron renderer process.
     */
    getElectron() {
      if (typeof require === 'function') {
        return require('electron');
      }
      return null;
    }

    /**
     * Helper to get the electron remote module, if running on Electron.
     * Note that is not guaranteed to be supported in the future - avoid if possible.
     */
    getElectronRemote = () => {
      if (typeof require === 'function') {
        const runtimeGameOptions = this._game.getAdditionalOptions();
        const moduleId =
          runtimeGameOptions && runtimeGameOptions.electronRemoteRequirePath
            ? runtimeGameOptions.electronRemoteRequirePath
            : '@electron/remote';

        try {
          return require(moduleId);
        } catch (requireError) {
          console.error(
            `Could not load @electron/remote from "${moduleId}". Error is:`,
            requireError
          );
        }
      }

      return null;
    };

    getGame() {
      return this._game;
    }

    private _throwIfDisposed(): void {
      if (this._wasDisposed) {
        throw 'The RuntimeGameRenderer has been disposed and should not be used anymore.';
      }
    }
  }

  //Register the class to let the engine use it.
  export type RuntimeGameRenderer = RuntimeGamePixiRenderer;
  export const RuntimeGameRenderer = RuntimeGamePixiRenderer;
}
