import RenderedInstance from './RenderedInstance';
const gd = global.gd;
const PIXI = global.PIXI;

/**
 * Renderer for a Text object.
 *
 * @extends RenderedInstance
 * @class RenderedTextInstance
 * @constructor
 */
function RenderedTextInstance(project, layout, instance, associatedObject, pixiContainer) {
    RenderedInstance.call( this, project, layout, instance, associatedObject, pixiContainer );

    //Setup the PIXI object:
    this._pixiObject = new PIXI.Text(" ", {align:"left"});
    this._pixiObject.anchor.x = 0.5;
    this._pixiObject.anchor.y = 0.5;
    this._pixiContainer.addChild(this._pixiObject);
}
RenderedTextInstance.prototype = Object.create( RenderedInstance.prototype );

/**
 * Return a URL for thumbnail of the specified object.
 * @method getThumbnail
 * @static
 */
RenderedTextInstance.getThumbnail = function(project, resourcesLoader, object) {
    return "CppPlatform/Extensions/texticon24.png";
};

RenderedTextInstance.prototype.update = function() {
    var textObject = gd.asTextObject(this._associatedObject);
    this._pixiObject.position.x = this._instance.getX() + this._pixiObject.width/2;
    this._pixiObject.position.y = this._instance.getY() + this._pixiObject.height/2;
    this._pixiObject.rotation = RenderedInstance.toRad(this._instance.getAngle());
    this._pixiObject.text = textObject.getString();

    //Update style
    var style = {align:"left"};
    style.font = "";
    if (textObject.isItalic()) style.font += "italic ";
    if (textObject.isBold()) style.font += "bold ";

    if (this._fontFilename !== textObject.getFontFilename()) { //Avoid calling getFontName if the font didn't changed.
        this._fontFilename = textObject.getFontFilename();
        console.warn("TODO: Font support");
        this._fontName = 'Arial';

        // this._fontName = this._renderingService.getFontName(textObject.getFontFilename()) || "Arial";
    }
    style.font += textObject.getCharacterSize() + "px  " + this._fontName;
    style.fill = "rgb(" + textObject.getColorR() + "," + textObject.getColorG()+"," + textObject.getColorB() + ")";
    this._pixiObject.style = style;
};

RenderedTextInstance.prototype.getDefaultWidth = function() {
    return this._pixiObject.width;
};

RenderedTextInstance.prototype.getDefaultHeight = function() {
    return this._pixiObject.height;
};

export default RenderedTextInstance;
