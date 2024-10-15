// @flow
import RenderedInstance from './RenderedInstance';
import PixiResourcesLoader from '../../ObjectsRendering/PixiResourcesLoader';
import ResourcesLoader from '../../ResourcesLoader';
import * as PIXI from 'pixi.js-legacy';
const gd: libGDevelop = global.gd;

type StretchedSprite = PIXI.Sprite | PIXI.TilingSprite;

/**
 * Renderer for gd.PanelSpriteObject
 *
 * Heavily inspired from the GDJS PIXI renderer for PanelSprite objects.
 */
export default class RenderedPanelSpriteInstance extends RenderedInstance {
  _centerSprite: StretchedSprite;
  _borderSprites: StretchedSprite[];

  // Cache of the values of the properties of the object, to detect
  // changes
  _textureName: string;
  _width: number;
  _height: number;
  _tiled: boolean;
  _leftMargin: number;
  _topMargin: number;
  _rightMargin: number;
  _bottomMargin: number;

  constructor(
    project: gdProject,
    instance: gdInitialInstance,
    associatedObjectConfiguration: gdObjectConfiguration,
    pixiContainer: PIXI.Container,
    pixiResourcesLoader: Class<PixiResourcesLoader>
  ) {
    super(
      project,
      instance,
      associatedObjectConfiguration,
      pixiContainer,
      pixiResourcesLoader
    );

    this.makeObjectsAndUpdateTextures();
  }

  update() {
    const panelSprite = gd.asPanelSpriteConfiguration(
      this._associatedObjectConfiguration
    );

    // Change in tiling needs PIXI objects to be recreated.
    if (panelSprite.isTiled() !== this._tiled) {
      this.makeObjectsAndUpdateTextures();
    }

    // Change in texture or margins needs textures to be recreated.
    if (
      panelSprite.getTexture() !== this._textureName ||
      panelSprite.getLeftMargin() !== this._leftMargin ||
      panelSprite.getTopMargin() !== this._topMargin ||
      panelSprite.getRightMargin() !== this._rightMargin ||
      panelSprite.getBottomMargin() !== this._bottomMargin
    ) {
      this.updateTextures();
    }

    // Change in position/angle is always applied.
    this.updateAngle();
    this.updatePosition();

    // Handle change in size.
    const oldWidth = this._width;
    const oldHeight = this._height;
    if (this._instance.hasCustomSize()) {
      this._width = this.getCustomWidth();
      this._height = this.getCustomHeight();
    } else {
      var tiledSprite = gd.asPanelSpriteConfiguration(
        this._associatedObjectConfiguration
      );
      this._width = tiledSprite.getWidth();
      this._height = tiledSprite.getHeight();
    }

    if (this._width !== oldWidth || this._height !== oldHeight) {
      this.updateWidthHeight();
    }

    // Do not hide completely an object so it can still be manipulated
    const alphaForDisplay = Math.max(this._instance.getOpacity() / 255, 0.5);
    this._pixiObject.alpha = alphaForDisplay;
  }

  makeObjectsAndUpdateTextures() {
    const panelSprite = gd.asPanelSpriteConfiguration(
      this._associatedObjectConfiguration
    );
    const texture = PixiResourcesLoader.getLoadingPIXITexture();

    this._tiled = panelSprite.isTiled();
    var StretchedSprite = !this._tiled ? PIXI.Sprite : PIXI.TilingSprite;

    if (!this._pixiObject) {
      this._pixiObject = new PIXI.Container();
      this._pixiContainer.addChild(this._pixiObject);
    }

    // All these textures are going to be replaced in the call to updateTextures.
    // But to be safe and preserve the invariant that "these objects own their own
    // textures", we create a new texture for each sprite.
    this._centerSprite = new StretchedSprite(new PIXI.Texture(texture));
    this._borderSprites = [
      new StretchedSprite(new PIXI.Texture(texture)), //Right
      new PIXI.Sprite(new PIXI.Texture(texture)), //Top-Right
      new StretchedSprite(new PIXI.Texture(texture)), //Top
      new PIXI.Sprite(new PIXI.Texture(texture)), //Top-Left
      new StretchedSprite(new PIXI.Texture(texture)), //Left
      new PIXI.Sprite(new PIXI.Texture(texture)), //Bottom-Left
      new StretchedSprite(new PIXI.Texture(texture)), //Bottom
      new PIXI.Sprite(new PIXI.Texture(texture)), //Bottom-Right
    ];

    this._pixiObject.removeChildren();
    this._pixiObject.addChild(this._centerSprite);
    for (var i = 0; i < this._borderSprites.length; ++i) {
      this._pixiObject.addChild(this._borderSprites[i]);
    }

    this.updateTextures();
  }

  onRemovedFromScene(): void {
    super.onRemovedFromScene();
    // Destroy textures because they are instantiated by this class:
    // all textures of borderSprites and centerSprite are "owned" by them.
    for (const borderSprite of this._borderSprites) {
      borderSprite.destroy({ texture: true });
    }
    // Destroy the containers without handling children because they are
    // already handled above.
    this._centerSprite.destroy({ texture: true });
    this._pixiObject.destroy(false);
  }

  updateAngle() {
    this._pixiObject.rotation = RenderedInstance.toRad(
      this._instance.getAngle()
    );
  }

  updatePosition() {
    this._pixiObject.x = this._instance.getX() + this._width / 2;
    this._pixiObject.y = this._instance.getY() + this._height / 2;
  }

  _updateLocalPositions() {
    const panelSprite = gd.asPanelSpriteConfiguration(
      this._associatedObjectConfiguration
    );

    this._centerSprite.position.x = panelSprite.getLeftMargin();
    this._centerSprite.position.y = panelSprite.getTopMargin();

    //Right
    this._borderSprites[0].position.x =
      this._width - panelSprite.getRightMargin();
    this._borderSprites[0].position.y = panelSprite.getTopMargin();

    //Top-right
    this._borderSprites[1].position.x =
      this._width - this._borderSprites[1].width;
    this._borderSprites[1].position.y = 0;

    //Top
    this._borderSprites[2].position.x = panelSprite.getLeftMargin();
    this._borderSprites[2].position.y = 0;

    //Top-Left
    this._borderSprites[3].position.x = 0;
    this._borderSprites[3].position.y = 0;

    //Left
    this._borderSprites[4].position.x = 0;
    this._borderSprites[4].position.y = panelSprite.getTopMargin();

    //Bottom-Left
    this._borderSprites[5].position.x = 0;
    this._borderSprites[5].position.y =
      this._height - this._borderSprites[5].height;

    //Bottom
    this._borderSprites[6].position.x = panelSprite.getLeftMargin();
    this._borderSprites[6].position.y =
      this._height - panelSprite.getBottomMargin();

    //Bottom-Right
    this._borderSprites[7].position.x =
      this._width - this._borderSprites[7].width;
    this._borderSprites[7].position.y =
      this._height - this._borderSprites[7].height;
  }

  _updateSpritesAndTexturesSize() {
    const panelSprite = gd.asPanelSpriteConfiguration(
      this._associatedObjectConfiguration
    );
    this._centerSprite.width = Math.max(
      this._width - panelSprite.getRightMargin() - panelSprite.getLeftMargin(),
      0
    );
    this._centerSprite.height = Math.max(
      this._height - panelSprite.getTopMargin() - panelSprite.getBottomMargin(),
      0
    );

    //Right
    this._borderSprites[0].width = panelSprite.getRightMargin();
    this._borderSprites[0].height = Math.max(
      this._height - panelSprite.getTopMargin() - panelSprite.getBottomMargin(),
      0
    );

    //Top
    this._borderSprites[2].height = panelSprite.getTopMargin();
    this._borderSprites[2].width = Math.max(
      this._width - panelSprite.getRightMargin() - panelSprite.getLeftMargin(),
      0
    );

    //Left
    this._borderSprites[4].width = panelSprite.getLeftMargin();
    this._borderSprites[4].height = Math.max(
      this._height - panelSprite.getTopMargin() - panelSprite.getBottomMargin(),
      0
    );

    //Bottom
    this._borderSprites[6].height = panelSprite.getBottomMargin();
    this._borderSprites[6].width = Math.max(
      this._width - panelSprite.getRightMargin() - panelSprite.getLeftMargin(),
      0
    );

    this._pixiObject.cacheAsBitmap = false;
  }

  updateTextures() {
    const panelSprite = gd.asPanelSpriteConfiguration(
      this._associatedObjectConfiguration
    );

    // Store the values used for rendering, to detect changes
    // that would need later to update the texture again.
    this._textureName = panelSprite.getTexture();
    this._leftMargin = panelSprite.getLeftMargin();
    this._topMargin = panelSprite.getTopMargin();
    this._rightMargin = panelSprite.getRightMargin();
    this._bottomMargin = panelSprite.getBottomMargin();

    const texture = PixiResourcesLoader.getPIXITexture(
      this._project,
      this._textureName
    );
    if (!texture.baseTexture.valid) {
      // Post pone texture update if texture is not loaded.
      texture.once('update', () => {
        if (this._wasDestroyed) return;
        this.updateTextures();
      });
      return;
    }

    function makeInsideTexture(rect) {
      if (rect.width < 0) rect.width = 0;
      if (rect.height < 0) rect.height = 0;
      if (rect.x < 0) rect.x = 0;
      if (rect.y < 0) rect.y = 0;
      if (rect.x > texture.width) rect.x = texture.width;
      if (rect.y > texture.height) rect.y = texture.height;
      if (rect.x + rect.width > texture.width)
        rect.width = texture.width - rect.x;
      if (rect.y + rect.height > texture.height)
        rect.height = texture.height - rect.y;

      return rect;
    }

    if (this._centerSprite.texture.valid)
      this._centerSprite.texture.destroy(false);
    this._centerSprite.texture = new PIXI.Texture(
      texture,
      makeInsideTexture(
        new PIXI.Rectangle(
          panelSprite.getLeftMargin(),
          panelSprite.getTopMargin(),
          texture.width -
            panelSprite.getLeftMargin() -
            panelSprite.getRightMargin(),
          texture.height -
            panelSprite.getTopMargin() -
            panelSprite.getBottomMargin()
        )
      )
    );

    //Right
    if (this._borderSprites[0].texture.valid)
      this._borderSprites[0].texture.destroy(false);
    this._borderSprites[0].texture = new PIXI.Texture(
      texture,
      makeInsideTexture(
        new PIXI.Rectangle(
          texture.width - panelSprite.getRightMargin(),
          panelSprite.getTopMargin(),
          panelSprite.getRightMargin(),
          texture.height -
            panelSprite.getTopMargin() -
            panelSprite.getBottomMargin()
        )
      )
    );

    //Top-right
    if (this._borderSprites[1].texture.valid)
      this._borderSprites[1].texture.destroy(false);
    this._borderSprites[1].texture = new PIXI.Texture(
      texture,
      makeInsideTexture(
        new PIXI.Rectangle(
          texture.width - panelSprite.getRightMargin(),
          0,
          panelSprite.getRightMargin(),
          panelSprite.getTopMargin()
        )
      )
    );

    //Top
    if (this._borderSprites[2].texture.valid)
      this._borderSprites[2].texture.destroy(false);
    this._borderSprites[2].texture = new PIXI.Texture(
      texture,
      makeInsideTexture(
        new PIXI.Rectangle(
          panelSprite.getLeftMargin(),
          0,
          texture.width -
            panelSprite.getLeftMargin() -
            panelSprite.getRightMargin(),
          panelSprite.getTopMargin()
        )
      )
    );

    //Top-Left
    if (this._borderSprites[3].texture.valid)
      this._borderSprites[3].texture.destroy(false);
    this._borderSprites[3].texture = new PIXI.Texture(
      texture,
      makeInsideTexture(
        new PIXI.Rectangle(
          0,
          0,
          panelSprite.getLeftMargin(),
          panelSprite.getTopMargin()
        )
      )
    );

    //Left
    if (this._borderSprites[4].texture.valid)
      this._borderSprites[4].texture.destroy(false);
    this._borderSprites[4].texture = new PIXI.Texture(
      texture,
      makeInsideTexture(
        new PIXI.Rectangle(
          0,
          panelSprite.getTopMargin(),
          panelSprite.getLeftMargin(),
          texture.height -
            panelSprite.getTopMargin() -
            panelSprite.getBottomMargin()
        )
      )
    );

    //Bottom-Left
    if (this._borderSprites[5].texture.valid)
      this._borderSprites[5].texture.destroy(false);
    this._borderSprites[5].texture = new PIXI.Texture(
      texture,
      makeInsideTexture(
        new PIXI.Rectangle(
          0,
          texture.height - panelSprite.getBottomMargin(),
          panelSprite.getLeftMargin(),
          panelSprite.getBottomMargin()
        )
      )
    );

    //Bottom
    if (this._borderSprites[6].texture.valid)
      this._borderSprites[6].texture.destroy(false);
    this._borderSprites[6].texture = new PIXI.Texture(
      texture,
      makeInsideTexture(
        new PIXI.Rectangle(
          panelSprite.getLeftMargin(),
          texture.height - panelSprite.getBottomMargin(),
          texture.width -
            panelSprite.getLeftMargin() -
            panelSprite.getRightMargin(),
          panelSprite.getBottomMargin()
        )
      )
    );

    //Bottom-Right
    if (this._borderSprites[7].texture.valid)
      this._borderSprites[7].texture.destroy(false);
    this._borderSprites[7].texture = new PIXI.Texture(
      texture,
      makeInsideTexture(
        new PIXI.Rectangle(
          texture.width - panelSprite.getRightMargin(),
          texture.height - panelSprite.getBottomMargin(),
          panelSprite.getRightMargin(),
          panelSprite.getBottomMargin()
        )
      )
    );

    this._updateSpritesAndTexturesSize();
    this._updateLocalPositions();
    this.updatePosition();
  }

  updateWidthHeight() {
    this._pixiObject.pivot.x = this._width / 2;
    this._pixiObject.pivot.y = this._height / 2;
    this._updateSpritesAndTexturesSize();
    this._updateLocalPositions();
    this.updatePosition();
  }

  getDefaultWidth() {
    const panelSprite = gd.asPanelSpriteConfiguration(
      this._associatedObjectConfiguration
    );
    return panelSprite.getWidth();
  }

  getDefaultHeight() {
    const panelSprite = gd.asPanelSpriteConfiguration(
      this._associatedObjectConfiguration
    );
    return panelSprite.getHeight();
  }

  /**
   * Return a URL for thumbnail of the specified object.
   */
  static getThumbnail(
    project: gdProject,
    resourcesLoader: Class<ResourcesLoader>,
    objectConfiguration: gdObjectConfiguration
  ) {
    const panelSprite = gd.asPanelSpriteConfiguration(objectConfiguration);

    return ResourcesLoader.getResourceFullUrl(
      project,
      panelSprite.getTexture(),
      {}
    );
  }
}
