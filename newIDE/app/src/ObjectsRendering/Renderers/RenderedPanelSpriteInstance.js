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
 * TODO: Find a way to factor GDJS objects and IDE instances renderers.
 */
export default class RenderedPanelSpriteInstance extends RenderedInstance {
  _centerSprite: StretchedSprite;
  _borderSprites: StretchedSprite[];
  _textureName: string;
  _width: number;
  _height: number;
  _tiled: boolean;
  _wasRendered: boolean;

  constructor(
    project: gdProject,
    layout: gdLayout,
    instance: gdInitialInstance,
    associatedObjectConfiguration: gdObjectConfiguration,
    pixiContainer: PIXI.Container,
    pixiResourcesLoader: Class<PixiResourcesLoader>
  ) {
    super(
      project,
      layout,
      instance,
      associatedObjectConfiguration,
      pixiContainer,
      pixiResourcesLoader
    );

    this.makeObjects();
    this.updateTexture();
  }

  update() {
    //TODO
    // if (this._pixiObject.visible && this._wasRendered) {
    //   this._pixiObject.cacheAsBitmap = true;
    // }
    // this._wasRendered = true;

    const panelSprite = gd.asPanelSpriteConfiguration(
      this._associatedObjectConfiguration
    );
    if (panelSprite.isTiled() !== this._tiled) {
      this.makeObjects();
    }
    if (panelSprite.getTexture() !== this._textureName) {
      this.updateTexture();
    }

    this.updateAngle();
    this.updatePosition();

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
  }

  makeObjects() {
    const panelSprite = gd.asPanelSpriteConfiguration(
      this._associatedObjectConfiguration
    );
    this._textureName = panelSprite.getTexture();
    const texture = PixiResourcesLoader.getPIXITexture(
      this._project,
      this._textureName
    );

    this._tiled = panelSprite.isTiled();
    var StretchedSprite = !this._tiled ? PIXI.Sprite : PIXI.TilingSprite;

    if (!this._pixiObject) {
      this._pixiObject = new PIXI.Container();
      this._pixiContainer.addChild(this._pixiObject);
    }
    this._centerSprite = new StretchedSprite(new PIXI.Texture(texture));
    this._borderSprites = [
      new StretchedSprite(new PIXI.Texture(texture)), //Right
      new PIXI.Sprite(texture), //Top-Right
      new StretchedSprite(new PIXI.Texture(texture)), //Top
      new PIXI.Sprite(texture), //Top-Left
      new StretchedSprite(new PIXI.Texture(texture)), //Left
      new PIXI.Sprite(texture), //Bottom-Left
      new StretchedSprite(new PIXI.Texture(texture)), //Bottom
      new PIXI.Sprite(texture), //Bottom-Right
    ];

    this._pixiObject.removeChildren();
    this._pixiObject.addChild(this._centerSprite);
    for (var i = 0; i < this._borderSprites.length; ++i) {
      this._pixiObject.addChild(this._borderSprites[i]);
    }
  }

  onRemovedFromScene(): void {
    super.onRemovedFromScene();
    // Destroy textures because they are instantiated by this class.
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

    this._wasRendered = true;
    this._pixiObject.cacheAsBitmap = false;
  }

  updateTexture() {
    const panelSprite = gd.asPanelSpriteConfiguration(
      this._associatedObjectConfiguration
    );
    this._textureName = panelSprite.getTexture();
    const texture = PixiResourcesLoader.getPIXITexture(
      this._project,
      this._textureName
    );

    if (!texture.baseTexture.valid) {
      // Post pone texture update if texture is not loaded.
      texture.once('update', () => this.updateTexture());
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
