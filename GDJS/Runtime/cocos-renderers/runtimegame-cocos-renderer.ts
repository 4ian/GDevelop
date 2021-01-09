/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * The renderer for a gdjs.RuntimeGame using Cocos2D-JS.
   */
  export class RuntimeGameCocosRenderer {
    _directorManager: any;
    _game: any;
    _gameLoopFn: any;

    constructor(game: gdjs.RuntimeGame, forceFullscreen: boolean) {
      this._directorManager = new gdjs.CocosDirectorManager();
      this._game = game;
    }

    updateRendererSize(): void {
      cc.view.setDesignResolutionSize(
        this._game.getGameResolutionWidth(),
        this._game.getGameResolutionHeight(),
        cc.view.getResolutionPolicy()
      );
    }

    /**
     * Set if the aspect ratio must be kept when the game rendering area is resized.
     */
    keepAspectRatio(enable) {
      // Not supported.
      console.warn('Aspect ratio is not supported.');
    }

    /**
     * Change the margin that must be preserved around the game.
     */
    setMargins(top, right, bottom, left): void {
      // Not supported.
      console.warn('Margins are not supported.');
    }

    /**
     * De/activate fullscreen for the game.
     */
    setFullScreen(enable): void {
      // TODO - not implemented yet
      console.warn('Fullscreen is not implemented yet.');
    }

    /**
     * Checks if the game is in full screen.
     */
    isFullScreen(): boolean {
      const electron = this.getElectron();
      if (electron) {
        return electron.remote.getCurrentWindow().isFullScreen();
      }
      return false;
    }

    // Unsupported
    /**
     * Update the window size, if possible.
     * @param width The new width, in pixels.
     * @param height The new height, in pixels.
     */
    setWindowSize(width: float, height: float): void {
      const electron = this.getElectron();
      if (electron) {
        // Use Electron BrowserWindow API
        const browserWindow = electron.remote.getCurrentWindow();
        if (browserWindow) {
          browserWindow.setContentSize(width, height);
        }
      } else {
        console.warn("Window size can't be changed on this platform.");
      }
    }

    /**
     * Center the window on screen.
     */
    centerWindow() {
      const electron = this.getElectron();
      if (electron) {
        // Use Electron BrowserWindow API
        const browserWindow = electron.remote.getCurrentWindow();
        if (browserWindow) {
          browserWindow.center();
        }
      } else {
      }
    }

    // Not supported
    setWindowTitle(title): void {
      if (typeof document !== 'undefined') {
        document.title = title;
      }
    }

    getWindowTitle() {
      return typeof document !== 'undefined' ? document.title : '';
    }

    startGameLoop(fn) {
      this._gameLoopFn = fn;
      this._gameLoopFn(0);
    }

    getDirectorManager() {
      return this._directorManager;
    }

    /**
     * As Cocos2d is managing the game loop, the Cocos scenes need to call this
     * function to step the game engine. See gdjs.RuntimeSceneCocosRenderer.
     */
    onSceneUpdated(dt) {
      if (!this._gameLoopFn(dt)) {
        this._directorManager.end();
      }
    }

    convertYPosition(y) {
      //Cocos2D Y axis is inverted, with origin at the bottom of the window.
      return this._currentHeight - y;
    }

    static getWindowInnerWidth() {
      return cc.view.getFrameSize().width;
    }

    static getWindowInnerHeight() {
      return cc.view.getFrameSize().height;
    }

    /**
     * Open the given URL in the system browser
     */
    openURL(url) {
      // Try to detect the environment to use the most adapted
      // way of opening an URL.
      if (typeof cc !== 'undefined' && cc.sys && cc.sys.openURL) {
        cc.sys.openURL(url);
      } else {
        if (typeof window !== 'undefined') {
          // @ts-ignore
          const target = window.cordova ? '_system' : '_blank';
          window.open(url, target);
        }
      }
    }

    stopGame() {
      // TODO - Not implemented as not useful for most games on mobile and browsers
      console.warn('Stopping the game is not supported.');
    }

    /**
     * Get the canvas DOM element.
     */
    getCanvas() {
      return cc.game.canvas;
    }

    /**
     * Check if the device supports WebGL.
     * @returns true if WebGL is supported
     */
    isWebGLSupported(): boolean {
      return cc._renderType === cc.game.RENDER_TYPE_WEBGL;
    }

    /**
     * Get the electron module, if running as a electron renderer process.
     */
    getElectron() {
      if (typeof require !== 'undefined') {
        return require('electron');
      }
      return null;
    }
  }
  gdjs.RuntimeGameRenderer = gdjs.RuntimeGameCocosRenderer;

  //Register the class to let the engine use it.
}
