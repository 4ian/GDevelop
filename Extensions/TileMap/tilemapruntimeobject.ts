namespace gdjs {
  /**
   * Displays a Tilemap object (mapeditor.org supported).
   * @memberof gdjs
   * @class TileMapRuntimeObject
   * @extends gdjs.RuntimeObject
   */
  export class TileMapRuntimeObject extends gdjs.RuntimeObject {
    _frameElapsedTime: float = 0;
    _opacity: float;
    _tilemapJsonFile: string;
    _tilesetJsonFile: string;
    _tilemapAtlasImage: string;
    _displayMode: string;
    _layerIndex: integer;
    _levelIndex: integer;
    _animationSpeedScale: number;
    _animationFps: number;
    _renderer: any;

    constructor(runtimeScene, objectData) {
      super(runtimeScene, objectData);
      this._opacity = objectData.content.opacity;
      this._tilemapJsonFile = objectData.content.tilemapJsonFile;
      this._tilesetJsonFile = objectData.content.tilesetJsonFile;
      this._tilemapAtlasImage = objectData.content.tilemapAtlasImage;
      this._displayMode = objectData.content.displayMode;
      this._layerIndex = objectData.content.layerIndex;
      this._levelIndex = objectData.content.levelIndex;
      this._animationSpeedScale = objectData.content.animationSpeedScale;
      this._animationFps = objectData.content.animationFps;
      if (this._renderer) {
        gdjs.TileMapRuntimeObjectRenderer.call(
          this._renderer,
          this,
          runtimeScene
        );
      } else {
        this._renderer = new gdjs.TileMapRuntimeObjectRenderer(
          this,
          runtimeScene
        );
      }

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    update(runtimeScene): void {
      if (this._animationSpeedScale <= 0 || this._animationFps === 0) {
        return;
      }
      const elapsedTime = this.getElapsedTime(runtimeScene) / 1000;
      this._frameElapsedTime += elapsedTime * this._animationSpeedScale;
      while (this._frameElapsedTime > 1 / this._animationFps) {
        this._renderer.incrementAnimationFrameX();
        this._frameElapsedTime -= 1 / this._animationFps;
      }
    }

    updateFromObjectData(oldObjectData: any, newObjectData: any): boolean {
      if (oldObjectData.content.opacity !== newObjectData.content.opacity) {
        this.setOpacity(newObjectData.content.opacity);
      }
      if (
        oldObjectData.content.tilemapJsonFile !==
        newObjectData.content.tilemapJsonFile
      ) {
        this.setTilemapJsonFile(newObjectData.content.tilemapJsonFile);
      }
      if (
        oldObjectData.content.tilesetJsonFile !==
        newObjectData.content.tilesetJsonFile
      ) {
        this.setTilesetJsonFile(newObjectData.content.tilesetJsonFile);
      }
      if (
        oldObjectData.content.displayMode !== newObjectData.content.displayMode
      ) {
        this.setDisplayMode(newObjectData.content.displayMode);
      }
      if (
        oldObjectData.content.layerIndex !== newObjectData.content.layerIndex
      ) {
        this.setLayerIndex(newObjectData.content.layerIndex);
      }
      if (
        oldObjectData.content.levelIndex !== newObjectData.content.levelIndex
      ) {
        this.setLevelIndex(newObjectData.content.levelIndex);
      }
      if (
        oldObjectData.content.animationSpeedScale !==
        newObjectData.content.animationSpeedScale
      ) {
        this.setAnimationSpeedScale(newObjectData.content.animationSpeedScale);
      }
      if (
        oldObjectData.content.animationFps !==
        newObjectData.content.animationFps
      ) {
        this.setAnimationFps(newObjectData.content.animationFps);
      }
      if (
        oldObjectData.content.tilemapAtlasImage !==
        newObjectData.content.tilemapAtlasImage
      ) {
        // TODO: support changing the atlas texture
        return false;
      }
      return true;
    }

    /**
     * Initialize the extra parameters that could be set for an instance.
     */
    extraInitializationFromInitialInstance(initialInstanceData) {
      if (initialInstanceData.customSize) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
      }
    }

    /**
     * Set the Tilemap json file to display.
     */
    setTilemapJsonFile(tilemapJsonFile): void {
      this._tilemapJsonFile = tilemapJsonFile;
      this._renderer.updateTileMap();
    }

    getTilemapJsonFile() {
      return this._tilemapJsonFile;
    }

    isTilemapJsonFile(selectedTilemapJsonFile): boolean {
      return this._tilemapJsonFile === selectedTilemapJsonFile;
    }

    setTilesetJsonFile(tilesetJsonFile) {
      this._tilesetJsonFile = tilesetJsonFile;
      this._renderer.updateTileMap();
    }
    getTilesetJsonFile() {
      return this._tilesetJsonFile;
    }
    setAnimationFps(animationFps) {
      this._animationFps = animationFps;
    }
    getAnimationFps() {
      return this._animationFps;
    }
    isTilesetJsonFile(selectedTilesetJsonFile) {
      return this._tilesetJsonFile === selectedTilesetJsonFile;
    }
    isDisplayMode(selectedDisplayMode) {
      return this._displayMode === selectedDisplayMode;
    }

    setDisplayMode(displayMode): void {
      this._displayMode = displayMode;
      this._renderer.updateTileMap();
    }

    getDisplayMode() {
      return this._displayMode;
    }

    setLayerIndex(layerIndex): void {
      this._layerIndex = layerIndex;
      this._renderer.updateTileMap();
    }

    getLayerIndex() {
      return this._layerIndex;
    }

    setLevelIndex(levelIndex): void {
      this._levelIndex = levelIndex;
      this._renderer.updateTileMap();
    }

    getLevelIndex() {
      return this._levelIndex;
    }

    setAnimationSpeedScale(animationSpeedScale): void {
      this._animationSpeedScale = animationSpeedScale;
    }

    getAnimationSpeedScale() {
      return this._animationSpeedScale;
    }

    /**
     * Set the width of the object.
     * @param width The new width.
     */
    setWidth(width: float): void {
      if (this._renderer.getWidth() === width) return;

      this._renderer.setWidth(width);
      this.hitBoxesDirty = true;
    }

    /**
     * Set the height of the object.
     * @param height The new height.
     */
    setHeight(height: float): void {
      if (this._renderer.getHeight() === height) return;

      this._renderer.setHeight(height);
      this.hitBoxesDirty = true;
    }

    /**
     * Set object position on X axis.
     * @param x The new position X of the object.
     */
    setX(x: float): void {
      super.setX(x);
      this._renderer.updatePosition();
    }

    /**
     * Set object position on Y axis.
     * @param y The new position Y of the object.
     */
    setY(y: float): void {
      super.setY(y);
      this._renderer.updatePosition();
    }

    /**
     * Set the angle of the object.
     * @param angle The new angle of the object.
     */
    setAngle(angle: float): void {
      super.setAngle(angle);
      this._renderer.updateAngle();
    }

    /**
     * Set object opacity.
     * @param opacity The new opacity of the object (0-255).
     */
    setOpacity(opacity: float): void {
      this._opacity = opacity;
      this._renderer.updateOpacity();
    }

    /**
     * Get object opacity.
     */
    getOpacity() {
      return this._opacity;
    }

    /**
     * Get the width of the object.
     */
    getWidth(): float {
      return this._renderer.getWidth();
    }

    /**
     * Get the height of the object.
     */
    getHeight(): float {
      return this._renderer.getHeight();
    }
  }
  gdjs.registerObject('TileMap::TileMap', gdjs.TileMapRuntimeObject);
}
