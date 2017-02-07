import RenderedInstance from './RenderedInstance';
const gd = global.gd;
const PIXI = global.PIXI;

/**
 * Renderer for gd.SpriteObject
 *
 * @extends RenderedInstance
 * @class RenderedSpriteInstance
 * @constructor
 */
function RenderedSpriteInstance(project, layout, instance, associatedObject, pixiContainer, resourcesLoader) {
    RenderedInstance.call( this, project, layout, instance, associatedObject, pixiContainer);

    this._renderedAnimation = 0;
    this._renderedDirection = 0; //TODO: Custom direction/angle support
    this._renderedSprite = 0; //Always render the first sprite of the animation
    this._centerX = 0;
    this._centerY = 0;

    //Setup the PIXI object:
    this._resourcesLoader = resourcesLoader;
    this._pixiObject = new PIXI.Sprite(PIXI.Texture.fromImage(this._resourcesLoader.getInvalidImageURL()));
    this._pixiContainer.addChild(this._pixiObject);
    this.updatePIXITexture();
    this.updatePIXISprite();
}
RenderedSpriteInstance.prototype = Object.create( RenderedInstance.prototype );

/**
 * Return a URL for thumbnail of the specified object.
 * @method getThumbnail
 * @static
 */
RenderedSpriteInstance.getThumbnail = function(project, layout, object) {
    var spriteObject = gd.asSpriteObject(object);

    if (spriteObject.getAnimationsCount() > 0 &&
        spriteObject.getAnimation(0).getDirectionsCount() > 0 &&
        spriteObject.getAnimation(0).getDirection(0).getSpritesCount() > 0) {

        const imageName = spriteObject.getAnimation(0).getDirection(0).getSprite(0).getImageName();
        return this._resourcesLoader.get(imageName);
    }

    return "res/unknown32.png";
};

RenderedSpriteInstance.prototype.updatePIXISprite = function() {
    this._pixiObject.anchor.x = this._centerX/this._pixiObject.texture.frame.width;
    this._pixiObject.anchor.y = this._centerY/this._pixiObject.texture.frame.height;
    this._pixiObject.rotation = RenderedInstance.toRad(this._instance.getAngle());
    if (this._instance.hasCustomSize()) {
        this._pixiObject.scale.x = this._instance.getCustomWidth()/this._pixiObject.texture.frame.width;
        this._pixiObject.scale.y = this._instance.getCustomHeight()/this._pixiObject.texture.frame.height;
    }
    this._pixiObject.position.x = this._instance.getX() + (this._centerX - this._originX)*Math.abs(this._pixiObject.scale.x);
    this._pixiObject.position.y = this._instance.getY() + (this._centerY - this._originY)*Math.abs(this._pixiObject.scale.y);
};

RenderedSpriteInstance.prototype.updatePIXITexture = function() {
    var spriteObject = gd.asSpriteObject(this._associatedObject);

    var properties = this._instance.getCustomProperties(this._project, this._layout);
    var property = properties.get("Animation");
    this._renderedAnimation = parseInt(property.getValue(), 10);
    if (this._renderedAnimation < spriteObject.getAnimationsCount()) {
        var animation = spriteObject.getAnimation(this._renderedAnimation);

        this._renderedDirection = 0; //TODO: Custom direction/angle support
        if (this._renderedDirection < animation.getDirectionsCount()) {
            var direction = animation.getDirection(this._renderedDirection);

            this._renderedSprite = 0;
            if (this._renderedSprite < direction.getSpritesCount()) {
                var sprite = direction.getSprite(this._renderedSprite);
                this._pixiObject.texture = PIXI.Texture.fromImage(
                    this._resourcesLoader.get(this._project, sprite.getImageName())
                );

                //TODO: Only default origin and center point are supported.
                if (this._pixiObject.texture.noFrame) {
                    var that = this;
                    this._pixiObject.texture.on("update", function() {
                        that._centerX = that._pixiObject.texture.width/2;
                        that._centerY = that._pixiObject.texture.height/2;
                        that._pixiObject.texture.off("update", this);
                    });
                } else {
                    this._centerX = this._pixiObject.texture.width/2;
                    this._centerY = this._pixiObject.texture.height/2;
                }
                this._originX = 0;
                this._originY = 0;
            }
        }
    }
};

RenderedSpriteInstance.prototype.update = function() {
    var properties = this._instance.getCustomProperties(this._project, this._layout);
    var property = properties.get("Animation");
    var animation = parseInt(property.getValue(), 10);

    if (this._renderedAnimation !== animation)
        this.updatePIXITexture();

    this.updatePIXISprite();
};

RenderedSpriteInstance.prototype.getDefaultWidth = function() {
    return Math.abs(this._pixiObject.width);
};

RenderedSpriteInstance.prototype.getDefaultHeight = function() {
    return Math.abs(this._pixiObject.height);
};

export default RenderedSpriteInstance;
