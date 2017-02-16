import RenderedInstance from './RenderedInstance';
const gd = global.gd;
const PIXI = global.PIXI;

/**
 * Renderer for gd.PanelSpriteObject
 *
 * @extends RenderedInstance
 * @class RenderedPanelSpriteInstance
 * @constructor
 */
function RenderedPanelSpriteInstance(project, layout, instance, associatedObject, pixiContainer, resourcesLoader) {
    RenderedInstance.call( this, project, layout, instance, associatedObject, pixiContainer );

    //Setup the PIXI object:
    var panelSprite = gd.asPanelSpriteObject(associatedObject);
    this._pixiObject = new PIXI.extras.TilingSprite(
        PIXI.Texture.fromImage(resourcesLoader.get(project, panelSprite.getTexture())),
        panelSprite.getWidth(),
        panelSprite.getHeight()
    );
    this._pixiContainer.addChild(this._pixiObject);
}
RenderedPanelSpriteInstance.prototype = Object.create( RenderedInstance.prototype );

/**
 * Return a URL for thumbnail of the specified object.
 * @method getThumbnail
 * @static
 */
RenderedPanelSpriteInstance.getThumbnail = function(project, resourcesLoader, object) {
    var panelSprite = gd.asPanelSpriteObject(object);

    return resourcesLoader.get(project, panelSprite.getTexture());
};

RenderedPanelSpriteInstance.prototype.update = function() {
    this._pixiObject.x = this._instance.getX();
    this._pixiObject.y = this._instance.getY();
    if (this._instance.hasCustomSize()) {
        this._pixiObject.width = this._instance.getCustomWidth();
        this._pixiObject.height = this._instance.getCustomHeight();
    } else {
        var panelSprite = gd.asPanelSpriteObject(this._associatedObject);
        this._pixiObject.width = panelSprite.getWidth();
        this._pixiObject.height = panelSprite.getHeight();
    }
};

RenderedPanelSpriteInstance.prototype.getDefaultWidth = function() {
    var panelSprite = gd.asPanelSpriteObject(this._associatedObject);
    return panelSprite.getWidth();
};

RenderedPanelSpriteInstance.prototype.getDefaultHeight = function() {
    var panelSprite = gd.asPanelSpriteObject(this._associatedObject);
    return panelSprite.getHeight();
};

export default RenderedPanelSpriteInstance;
