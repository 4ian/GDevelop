import RenderedInstance from './RenderedInstance';
const gd = global.gd;
const PIXI = global.PIXI;

/**
 * Renderer for gd.TiledSpriteObject
 *
 * @extends RenderedInstance
 * @class RenderedTiledSpriteInstance
 * @constructor
 */
function RenderedTiledSpriteInstance(project, layout, instance, associatedObject, pixiContainer) {
    RenderedInstance.call( this, project, layout, instance, associatedObject, pixiContainer );

    //Setup the PIXI object:
    var tiledSprite = gd.asTiledSpriteObject(associatedObject);
    this._pixiObject = new PIXI.extras.TilingSprite(PIXI.Texture.fromImage(tiledSprite.getTexture()), //TODO
        tiledSprite.getWidth(), tiledSprite.getHeight());
    this._pixiContainer.addChild(this._pixiObject);
}
RenderedTiledSpriteInstance.prototype = Object.create( RenderedInstance.prototype );

/**
 * Return a URL for thumbnail of the specified object.
 * @method getThumbnail
 * @static
 */
RenderedTiledSpriteInstance.getThumbnail = function(project, layout, object) {
    var tiledSprite = gd.asTiledSpriteObject(object);

    var texture = tiledSprite.getTexture();
    return texture ? texture : "res/unknown32.png";
};

RenderedTiledSpriteInstance.prototype.update = function() {
    this._pixiObject.x = this._instance.getX();
    this._pixiObject.y = this._instance.getY();
    if (this._instance.hasCustomSize()) {
        this._pixiObject.width = this._instance.getCustomWidth();
        this._pixiObject.height = this._instance.getCustomHeight();
    } else {
        var tiledSprite = gd.asTiledSpriteObject(this._associatedObject);
        this._pixiObject.width = tiledSprite.getWidth();
        this._pixiObject.height = tiledSprite.getHeight();
    }
};

RenderedTiledSpriteInstance.prototype.getDefaultWidth = function() {
    var tiledSprite = gd.asTiledSpriteObject(this._associatedObject);
    return tiledSprite.getWidth();
};

RenderedTiledSpriteInstance.prototype.getDefaultHeight = function() {
    var tiledSprite = gd.asTiledSpriteObject(this._associatedObject);
    return tiledSprite.getHeight();
};

export default RenderedTiledSpriteInstance;
