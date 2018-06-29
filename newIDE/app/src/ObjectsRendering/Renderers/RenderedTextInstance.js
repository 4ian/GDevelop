import RenderedInstance from './RenderedInstance';
import PIXI from 'pixi.js';
const gd = global.gd;

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

  //Setup the PIXI object:
  const textObject = gd.asTextObject(this._associatedObject);
  this._pixiObject = new PIXI.Text(' ', { align: 'left' });
  this._pixiObject.anchor.x = 0.5;
  this._pixiObject.anchor.y = 0.5;
  this._pixiContainer.addChild(this._pixiObject);
  this._styleFontDirty = true;
  this._fontFamily = this._pixiResourcesLoader.getFontFamily(
    this._project,
    textObject.getFontFilename()
  );
  this.update();
}
RenderedTextInstance.prototype = Object.create(RenderedInstance.prototype);

/**
 * Return a URL for thumbnail of the specified object.
 * @method getThumbnail
 * @static
 */
RenderedTextInstance.getThumbnail = function(project, resourcesLoader, object) {
  return 'CppPlatform/Extensions/texticon24.png';
};

RenderedTextInstance.prototype.update = function() {
  const textObject = gd.asTextObject(this._associatedObject);
  this._pixiObject.position.x =
    this._instance.getX() + this._pixiObject.width / 2;
  this._pixiObject.position.y =
    this._instance.getY() + this._pixiObject.height / 2;
  this._pixiObject.rotation = RenderedInstance.toRad(this._instance.getAngle());
  this._pixiObject.text = textObject.getString();

  //Update style, only if needed to avoid destroying text rendering performances
  if (
    textObject.isItalic() !== this._isItalic ||
    textObject.isBold() !== this._isBold ||
    textObject.getCharacterSize() !== this._characterSize
  ) {
    this._isItalic = textObject.isItalic();
    this._isBold = textObject.isBold();
    this._characterSize = textObject.getCharacterSize();
    this._styleFontDirty = true;
  }

  if (this._fontFilename !== textObject.getFontFilename()) {
    //Avoid calling loadFontFamily if the font didn't changed.
    this._fontFilename = textObject.getFontFilename();
    this._pixiResourcesLoader
      .loadFontFamily(this._project, textObject.getFontFilename())
      .then(fontFamily => {
        // Once the font is loaded, we can use the given fontFamily.
        this._fontFamily = fontFamily;
        this._styleFontDirty = true;
      })
      .catch(err => {
        // Ignore errors
        console.warn('Unable to load font family', err);
      });
  }

  if (this._styleFontDirty) {
    let font = '';
    if (this._isItalic) font += 'italic ';
    if (this._isBold) font += 'bold ';
    font += this._characterSize + 'px ' + (this._fontFamily || 'Arial');

    this._pixiObject.style.font = font;

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
};

RenderedTextInstance.prototype.getDefaultWidth = function() {
  return this._pixiObject.width;
};

RenderedTextInstance.prototype.getDefaultHeight = function() {
  return this._pixiObject.height;
};

export default RenderedTextInstance;
