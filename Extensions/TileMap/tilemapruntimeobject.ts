/// <reference path="helper/TileMapHelper.d.ts" />
namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;

  const logger = new gdjs.Logger('Tilemap object');
  /**
   * Displays a Tilemap object (mapeditor.org supported).
   */
  export class TileMapRuntimeObject extends gdjs.RuntimeObject {
    _frameElapsedTime: float = 0;
    _opacity: float;
    _tilemapJsonFile: string;
    _tilesetJsonFile: string;
    _tilemapAtlasImage: string;
    _displayMode: string;
    _layerIndex: integer;
    _animationSpeedScale: number;
    _animationFps: number;
    _tileMapManager: gdjs.TileMap.TileMapRuntimeManager;
    _renderer: gdjs.TileMapRuntimeObjectPixiRenderer;

    constructor(runtimeScene: gdjs.RuntimeInstancesContainer, objectData) {
      super(runtimeScene, objectData);
      this._opacity = objectData.content.opacity;
      this._tilemapJsonFile = objectData.content.tilemapJsonFile;
      this._tilesetJsonFile = objectData.content.tilesetJsonFile;
      this._tilemapAtlasImage = objectData.content.tilemapAtlasImage;
      this._displayMode = objectData.content.displayMode;
      this._layerIndex = objectData.content.layerIndex;
      this._animationSpeedScale = objectData.content.animationSpeedScale;
      this._animationFps = objectData.content.animationFps;
      this._tileMapManager = gdjs.TileMap.TileMapRuntimeManager.getManager(
        runtimeScene
      );
      this._renderer = new gdjs.TileMapRuntimeObjectRenderer(
        this,
        runtimeScene
      );
      this._updateTileMap();

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    update(runtimeScene: gdjs.RuntimeInstancesContainer): void {
      if (this._animationSpeedScale <= 0 || this._animationFps === 0) {
        return;
      }
      const elapsedTime = this.getElapsedTime(runtimeScene) / 1000;
      this._frameElapsedTime += elapsedTime * this._animationSpeedScale;
      while (this._frameElapsedTime > 1 / this._animationFps) {
        this._renderer.incrementAnimationFrameX(runtimeScene);
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

    extraInitializationFromInitialInstance(initialInstanceData): void {
      if (initialInstanceData.customSize) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
      }
    }

    private _updateTileMap(): void {
      this._tileMapManager.getOrLoadTileMap(
        this._tilemapJsonFile,
        this._tilesetJsonFile,
        (tileMap: TileMapHelper.EditableTileMap | null) => {
          if (!tileMap) {
            // getOrLoadTileMap already warn.
            return;
          }
          this._tileMapManager.getOrLoadTextureCache(
            (textureName) =>
              (this._runtimeScene
                .getGame()
                .getImageManager()
                .getPIXITexture(textureName) as unknown) as PIXI.BaseTexture<
                PIXI.Resource
              >,
            this._tilemapAtlasImage,
            this._tilemapJsonFile,
            this._tilesetJsonFile,
            (textureCache: TileMapHelper.TileTextureCache | null) => {
              if (!textureCache) {
                // getOrLoadTextureCache already log warns and errors.
                return;
              }
              this._renderer.updatePixiTileMap(tileMap, textureCache);
            }
          );
        }
      );
    }

    /**
     * Set the Tilemap json file to display.
     */
    setTilemapJsonFile(tilemapJsonFile: string): void {
      this._tilemapJsonFile = tilemapJsonFile;
      this._updateTileMap();
    }

    getTilemapJsonFile(): string {
      return this._tilemapJsonFile;
    }

    isTilemapJsonFile(selectedTilemapJsonFile: string): boolean {
      return this._tilemapJsonFile === selectedTilemapJsonFile;
    }

    setTilesetJsonFile(tilesetJsonFile: string): void {
      this._tilesetJsonFile = tilesetJsonFile;
      this._updateTileMap();
    }

    getTilesetJsonFile(): string {
      return this._tilesetJsonFile;
    }

    setAnimationFps(animationFps: float) {
      this._animationFps = animationFps;
    }

    getAnimationFps(): float {
      return this._animationFps;
    }

    isTilesetJsonFile(selectedTilesetJsonFile: string): boolean {
      return this._tilesetJsonFile === selectedTilesetJsonFile;
    }

    isDisplayMode(selectedDisplayMode: string): boolean {
      return this._displayMode === selectedDisplayMode;
    }

    setDisplayMode(displayMode: string): void {
      this._displayMode = displayMode;
      this._updateTileMap();
    }

    getDisplayMode(): string {
      return this._displayMode;
    }

    setLayerIndex(layerIndex): void {
      this._layerIndex = layerIndex;
      this._updateTileMap();
    }

    getLayerIndex(): integer {
      return this._layerIndex;
    }

    setAnimationSpeedScale(animationSpeedScale): void {
      this._animationSpeedScale = animationSpeedScale;
    }

    getAnimationSpeedScale(): float {
      return this._animationSpeedScale;
    }

    /**
     * Change the width of the object. This changes the scale on X axis of the object.
     *
     * @param width The new width of the object, in pixels.
     */
    setWidth(width: float): void {
      if (this.getWidth() === width) return;

      this._renderer.setWidth(width);
      this.invalidateHitboxes();
    }

    /**
     * Change the height of the object. This changes the scale on Y axis of the object.
     *
     * @param height The new height of the object, in pixels.
     */
    setHeight(height: float): void {
      if (this.getHeight() === height) return;

      this._renderer.setHeight(height);
      this.invalidateHitboxes();
    }

    /**
     * Change the scale on X and Y axis of the object.
     *
     * @param scale The new scale (must be greater than 0).
     */
    setScale(scale: float): void {
      this.setScaleX(scale);
      this.setScaleY(scale);
    }

    /**
     * Change the scale on X axis of the object (changing its width).
     *
     * @param scaleX The new scale (must be greater than 0).
     */
    setScaleX(scaleX: float): void {
      if (scaleX < 0) {
        scaleX = 0;
      }
      if (this.getScaleX() === scaleX) return;

      this._renderer.setScaleX(scaleX);
      this.invalidateHitboxes();
    }

    /**
     * Change the scale on Y axis of the object (changing its width).
     *
     * @param scaleY The new scale (must be greater than 0).
     */
    setScaleY(scaleY: float): void {
      if (scaleY < 0) {
        scaleY = 0;
      }
      if (this.getScaleY() === scaleY) return;

      this._renderer.setScaleY(scaleY);
      this.invalidateHitboxes();
    }

    setX(x: float): void {
      super.setX(x);
      this._renderer.updatePosition();
    }

    setY(y: float): void {
      super.setY(y);
      this._renderer.updatePosition();
    }

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
    getOpacity(): float {
      return this._opacity;
    }

    getWidth(): float {
      return this._renderer.getWidth();
    }

    getHeight(): float {
      return this._renderer.getHeight();
    }

    getScaleX(): float {
      return this._renderer.getScaleX();
    }

    getScaleY(): float {
      return this._renderer.getScaleY();
    }
  }
  gdjs.registerObject('TileMap::TileMap', gdjs.TileMapRuntimeObject);
}
