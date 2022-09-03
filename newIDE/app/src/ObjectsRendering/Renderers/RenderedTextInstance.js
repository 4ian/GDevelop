// @flow
import RenderedInstance from './RenderedInstance';
import PixiResourcesLoader from '../../ObjectsRendering/PixiResourcesLoader';
import ResourcesLoader from '../../ResourcesLoader';
import * as PIXI from 'pixi.js-legacy';
const gd: libGDevelop = global.gd;

/**
 * Renderer for a Text object.
 */
export default class RenderedTextInstance extends RenderedInstance {
  _isItalic: boolean = false;
  _isBold: boolean = false;
  _characterSize: number = 0;
  _wrapping: boolean = false;
  _wrappingWidth: number = 0;
  _styleFontDirty: boolean = true;
  _fontName: string = '';
  _fontFamily: string = '';
  _colorR: number = 0;
  _colorG: number = 0;
  _colorB: number = 0;

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

    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 20,
      align: 'left',
      padding: 5,
    });

    //Setup the PIXI object:
    this._pixiObject = new PIXI.Text('', style);
    this._pixiObject.anchor.x = 0.5;
    this._pixiObject.anchor.y = 0.5;
    this._pixiContainer.addChild(this._pixiObject);
    this._styleFontDirty = true;
    this.update();
  }

  /**
   * Return a URL for thumbnail of the specified object.
   */
  static getThumbnail(
    project: gdProject,
    resourcesLoader: Class<ResourcesLoader>,
    object: gdObject
  ) {
    return 'CppPlatform/Extensions/texticon24.png';
  }

  update() {
    const textObjectConfiguration = gd.asTextObjectConfiguration(
      this._associatedObjectConfiguration
    );
    this._pixiObject.text = textObjectConfiguration.getString();

    //Update style, only if needed to avoid destroying text rendering performances
    if (
      textObjectConfiguration.isItalic() !== this._isItalic ||
      textObjectConfiguration.isBold() !== this._isBold ||
      textObjectConfiguration.getCharacterSize() !== this._characterSize ||
      this._instance.hasCustomSize() !== this._wrapping ||
      (this._instance.getCustomWidth() !== this._wrappingWidth &&
        this._wrapping)
    ) {
      this._isItalic = textObjectConfiguration.isItalic();
      this._isBold = textObjectConfiguration.isBold();
      this._characterSize = textObjectConfiguration.getCharacterSize();
      this._wrapping = this._instance.hasCustomSize();
      this._wrappingWidth = this._instance.getCustomWidth();
      this._styleFontDirty = true;
    }

    if (this._fontName !== textObjectConfiguration.getFontName()) {
      //Avoid calling loadFontFamily if the font didn't changed.
      this._fontName = textObjectConfiguration.getFontName();
      PixiResourcesLoader.loadFontFamily(
        this._project,
        textObjectConfiguration.getFontName()
      )
        .then(fontFamily => {
          // Once the font is loaded, we can use the given fontFamily.
          this._fontFamily = fontFamily;
          this._styleFontDirty = true;
        })
        .catch(err => {
          // Ignore errors
          console.warn(
            'Unable to load font family for RenderedTextInstance',
            err
          );
        });
    }

    if (this._styleFontDirty) {
      this._pixiObject.style.fontFamily = this._fontFamily || 'Arial';
      this._pixiObject.style.fontSize = Math.max(1, this._characterSize);
      this._pixiObject.style.fontStyle = this._isItalic ? 'italic' : 'normal';
      this._pixiObject.style.fontWeight = this._isBold ? 'bold' : 'normal';
      this._pixiObject.style.wordWrap = this._wrapping;
      this._pixiObject.style.wordWrapWidth =
        this._wrappingWidth <= 1 ? 1 : this._wrappingWidth;
      this._pixiObject.style.breakWords = true;

      // Manually ask the PIXI object to re-render as we changed a style property
      // see http://www.html5gamedevs.com/topic/16924-change-text-style-post-render/
      this._pixiObject.dirty = true;
      this._styleFontDirty = false;
    }

    if (
      textObjectConfiguration.getColorR() !== this._colorR ||
      textObjectConfiguration.getColorG() !== this._colorG ||
      textObjectConfiguration.getColorB() !== this._colorB
    ) {
      this._colorR = textObjectConfiguration.getColorR();
      this._colorG = textObjectConfiguration.getColorG();
      this._colorB = textObjectConfiguration.getColorB();
      this._pixiObject.style.fill =
        'rgb(' + this._colorR + ',' + this._colorG + ',' + this._colorB + ')';

      // Manually ask the PIXI object to re-render as we changed a style property
      // see http://www.html5gamedevs.com/topic/16924-change-text-style-post-render/
      this._pixiObject.dirty = true;
    }

    this._pixiObject.position.x =
      this._instance.getX() + this._pixiObject.width / 2;
    this._pixiObject.position.y =
      this._instance.getY() + this._pixiObject.height / 2;
    this._pixiObject.rotation = RenderedInstance.toRad(
      this._instance.getAngle()
    );
  }

  getDefaultWidth() {
    return this._pixiObject.width;
  }

  getDefaultHeight() {
    return this._pixiObject.height;
  }
}
