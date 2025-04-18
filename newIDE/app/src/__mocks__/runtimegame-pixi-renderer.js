class RuntimeGamePixiRenderer {
  constructor(game, forceFullscreen) {
    this._game = game;
    this._forceFullscreen = forceFullscreen;
    this._isFullscreen = false;
    this._setupFullscreenListeners();
  }

  _setupFullscreenListeners() {
    document.addEventListener('fullscreenchange', this._onFullscreenChange.bind(this));
    document.addEventListener('webkitfullscreenchange', this._onFullscreenChange.bind(this));
    document.addEventListener('mozfullscreenchange', this._onFullscreenChange.bind(this));
  }

  _onFullscreenChange() {
    this._isFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement
    );
  }

  isFullScreen() {
    return this._isFullscreen;
  }

  setFullScreen(enable) {
    this._isFullscreen = enable;
  }

  dispose() {
    document.removeEventListener('fullscreenchange', this._onFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this._onFullscreenChange);
    document.removeEventListener('mozfullscreenchange', this._onFullscreenChange);
  }
}

export { RuntimeGamePixiRenderer }; 