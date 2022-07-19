import RenderedInstance from './RenderedInstance';
import * as PIXI from '../../PIXI';
const gd /* TODO: add flow in this file */ = global.gd;

/**
 * Renderer for a Text object.
 *
 * @extends RenderedInstance
 * @class RenderedTextInstance
 * @constructor
 */
function RenderedTextInstance(
  project,
  layout,
  instance,
  associatedObject,
  pixiContainer,
  pixiResourcesLoader
) {
  RenderedInstance.call(
    this,
    project,
    layout,
    instance,
    associatedObject,
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
RenderedTextInstance.prototype = Object.create(RenderedInstance.prototype);

/**
 * Return a URL for thumbnail of the specified object.
 */
RenderedTextInstance.getThumbnail = function(project, resourcesLoader, object) {
  return 'CppPlatform/Extensions/texticon24.png';
};

RenderedTextInstance.prototype.update = function() {
  const textObject = gd.asTextObject(this._associatedObject);
  this._pixiObject.text = textObject.getString();

  //Update style, only if needed to avoid destroying text rendering performances
  if (
    textObject.isItalic() !== this._isItalic ||
    textObject.isBold() !== this._isBold ||
    textObject.getCharacterSize() !== this._characterSize ||
    this._instance.hasCustomSize() !== this._wrapping ||
    (this._instance.getCustomWidth() !== this._wrappingWidth && this._wrapping)
  ) {
    this._isItalic = textObject.isItalic();
    this._isBold = textObject.isBold();
    this._characterSize = textObject.getCharacterSize();
    this._wrapping = this._instance.hasCustomSize();
    this._wrappingWidth = this._instance.getCustomWidth();
    this._styleFontDirty = true;
  }

  if (this._fontName !== textObject.getFontName()) {
    //Avoid calling loadFontFamily if the font didn't changed.
    this._fontName = textObject.getFontName();
    this._pixiResourcesLoader
      .loadFontFamily(this._project, textObject.getFontName())
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
    textObject.getColorR() !== this._colorR ||
    textObject.getColorG() !== this._colorG ||
    textObject.getColorB() !== this._colorB
  ) {
    this._colorR = textObject.getColorR();
    this._colorG = textObject.getColorG();
    this._colorB = textObject.getColorB();
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
  this._pixiObject.rotation = RenderedInstance.toRad(this._instance.getAngle());
};

RenderedTextInstance.prototype.getDefaultWidth = function() {
  return this._pixiObject.width;
};

RenderedTextInstance.prototype.getDefaultHeight = function() {
  return this._pixiObject.height;
};

export default RenderedTextInstance;
