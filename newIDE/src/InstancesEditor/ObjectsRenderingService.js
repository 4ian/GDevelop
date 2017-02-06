const gd = global.gd;
const PIXI = global.PIXI;


import optionalRequire from '../Utils/OptionalRequire.js';
const electron = optionalRequire('electron');
const path = optionalRequire('path');

class ResourceLoader {
    static get(project, resourceName) {
        if (electron) {
            const file = project.getProjectFile();
            const projectPath = path.dirname(file);
            const resourceRelativePath =
                project.getResourcesManager().getResource(resourceName).getFile();
            const resourceAbsolutePath = path.resolve(projectPath, resourceRelativePath);
            console.log("Loading", resourceAbsolutePath);
            return 'file://' + resourceAbsolutePath;
        }

        return resourceName;
    }
};

/**
 * RendereredInstance represents the object associated to an instance
 * when it is rendered in a scene editor (see SceneAreaCtrl).
 *
 * @class RendereredInstance
 * @constructor
 * @param associatedObject The (layout or global) object that the instance is associated to.
 * @param pixiContainer The PIXI.DisplayObjectContainer where the instance must be rendered
 */
function RendereredInstance(project, layout, instance, associatedObject, pixiContainer) {

    this._pixiObject = null;
    this._instance = instance;
    this._associatedObject = associatedObject;
    this._pixiContainer = pixiContainer;
    this._project = project;
    this._layout = layout;
    this.wasUsed = true; //Used by SceneAreaCtrl to track rendered instance that are not used anymore.
}

/**
 * Convert an angle from degrees to radians.
 * @static
 * @method toRad
 */
RendereredInstance.toRad = function(angleInDegrees) {
    return angleInDegrees/180*3.14159;
};

/**
 * Called when the scene editor is rendered.
 * @method update
 */
RendereredInstance.prototype.update = function() {
    //Nothing to do.
};

/**
 * Called to notify the instance renderer that its associated instance was removed from
 * the scene. The PIXI object should probably be removed from the container: This is what
 * the default implementation of the method does.
 * @method instanceRemovedFromScene
 */
RendereredInstance.prototype.instanceRemovedFromScene = function() {
    if (this._pixiObject !== null && this._pixiContainer.children.indexOf(this._pixiObject) !== -1)
        this._pixiContainer.removeChild(this._pixiObject);
};

/**
 * Return the width of the instance when the instance doesn't have a custom size.
 * @method getDefaultWidth
 */
RendereredInstance.prototype.getDefaultWidth = function() {
    return 32;
};

/**
 * Return the height of the instance when the instance doesn't have a custom size.
 * @method getDefaultHeight
 */
RendereredInstance.prototype.getDefaultHeight = function() {
    return 32;
};

/**
 * Objects with an unknown type are rendered with a placeholder rectangle.
 *
 * @extends RendereredInstance
 * @class RenderedUnknownInstance
 * @constructor
 */
function RenderedUnknownInstance(project, layout, instance, associatedObject, pixiContainer) {

    RendereredInstance.call( this, project, layout, instance, associatedObject, pixiContainer );

    //This renderer show a placeholder for the object:
    this._pixiObject = new PIXI.Graphics();
    this._pixiContainer.addChild(this._pixiObject);

    var width = instance.hasCustomSize() ? instance.getCustomWidth() : 32;
    var height = instance.hasCustomSize() ? instance.getCustomHeight() : 32;

    this._pixiObject.beginFill(0x0033FF);
    this._pixiObject.lineStyle(1, 0xffd900, 1);
    this._pixiObject.moveTo(0, 0);
    this._pixiObject.lineTo(width, 0);
    this._pixiObject.lineTo(width, height);
    this._pixiObject.lineTo(0, height);
    this._pixiObject.endFill();
}
RenderedUnknownInstance.prototype = Object.create( RendereredInstance.prototype );
RenderedUnknownInstance.getThumbnail = function(project, layout, object) {
    return "res/unknown32.png";
};

RenderedUnknownInstance.prototype.update = function() {
    this._pixiObject.position.x = this._instance.getX();
    this._pixiObject.position.y = this._instance.getY();
    this._pixiObject.rotation = this._instance.getAngle()*Math.PI/180.0;
};

/**
 * Renderer for gd.SpriteObject
 *
 * @extends RendereredInstance
 * @class RenderedSpriteInstance
 * @constructor
 */
function RenderedSpriteInstance(project, layout, instance, associatedObject, pixiContainer) {
    RendereredInstance.call( this, project, layout, instance, associatedObject, pixiContainer );
    var spriteObject = gd.asSpriteObject(associatedObject);

    this._renderedAnimation = 0;
    this._renderedDirection = 0; //TODO: Custom direction/angle support
    this._renderedSprite = 0; //Always render the first sprite of the animation
    this._centerX = 0;
    this._centerY = 0;

    //Setup the PIXI object:
    this._pixiObject = new PIXI.Sprite(PIXI.Texture.fromImage(RenderedSpriteInstance.invalidImageURL));
    this._pixiContainer.addChild(this._pixiObject);
    this.updatePIXITexture();
    this.updatePIXISprite();
}
RenderedSpriteInstance.prototype = Object.create( RendereredInstance.prototype );
RenderedSpriteInstance.invalidImageURL = "res/error48.png";

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

        var imageName = spriteObject.getAnimation(0).getDirection(0).getSprite(0).getImageName();
        return imageName;
    }

    return "res/unknown32.png";
};

RenderedSpriteInstance.prototype.updatePIXISprite = function() {
    this._pixiObject.anchor.x = this._centerX/this._pixiObject.texture.frame.width;
    this._pixiObject.anchor.y = this._centerY/this._pixiObject.texture.frame.height;
    this._pixiObject.rotation = RendereredInstance.toRad(this._instance.getAngle());
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
                this._pixiObject.texture = PIXI.Texture.fromImage(ResourceLoader.get(this._project, sprite.getImageName()));

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

/**
 * Renderer for gd.TiledSpriteObject
 *
 * @extends RendereredInstance
 * @class RenderedTiledSpriteInstance
 * @constructor
 */
function RenderedTiledSpriteInstance(project, layout, instance, associatedObject, pixiContainer) {
    RendereredInstance.call( this, project, layout, instance, associatedObject, pixiContainer );

    //Setup the PIXI object:
    var tiledSprite = gd.asTiledSpriteObject(associatedObject);
    this._pixiObject = new PIXI.extras.TilingSprite(PIXI.Texture.fromImage(tiledSprite.getTexture()),
        tiledSprite.getWidth(), tiledSprite.getHeight());
    this._pixiContainer.addChild(this._pixiObject);
}
RenderedTiledSpriteInstance.prototype = Object.create( RendereredInstance.prototype );

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

/**
 * Renderer for a Text object.
 *
 * @extends RendereredInstance
 * @class RenderedTextInstance
 * @constructor
 */
function RenderedTextInstance(project, layout, instance, associatedObject, pixiContainer, renderingService) {
    RendereredInstance.call( this, project, layout, instance, associatedObject, pixiContainer );

    //Setup the PIXI object:
    this._pixiObject = new PIXI.Text(" ", {align:"left"});
    this._pixiObject.anchor.x = 0.5;
    this._pixiObject.anchor.y = 0.5;
    this._renderingService = renderingService;
    this._pixiContainer.addChild(this._pixiObject);
}
RenderedTextInstance.prototype = Object.create( RendereredInstance.prototype );

/**
 * Return a URL for thumbnail of the specified object.
 * @method getThumbnail
 * @static
 */
RenderedTextInstance.getThumbnail = function(project, layout, object) {
    return "CppPlatform/Extensions/texticon24.png";
};

RenderedTextInstance.prototype.update = function() {
    var textObject = gd.asTextObject(this._associatedObject);
    this._pixiObject.position.x = this._instance.getX() + this._pixiObject.width/2;
    this._pixiObject.position.y = this._instance.getY() + this._pixiObject.height/2;
    this._pixiObject.rotation = RendereredInstance.toRad(this._instance.getAngle());
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
    style.font += textObject.getCharacterSize()+"px"+" "+this._fontName;
    style.fill = "rgb("+textObject.getColorR()+","+textObject.getColorG()+","+textObject.getColorB()+")";
    this._pixiObject.style = style;
};

RenderedTextInstance.prototype.getDefaultWidth = function() {
    return this._pixiObject.width;
};

RenderedTextInstance.prototype.getDefaultHeight = function() {
    return this._pixiObject.height;
};

/**
 * Renderer for an AdMob object.
 *
 * @extends RendereredInstance
 * @class RenderedAdMobInstance
 * @constructor
 */
function RenderedAdMobInstance(project, layout, instance, associatedObject, pixiContainer, renderingService) {
    RendereredInstance.call( this, project, layout, instance, associatedObject, pixiContainer );

    //Setup the PIXI object:
    this._pixiObject = new PIXI.Container();
    this._pixiContainer.addChild(this._pixiObject);

    this._titleText = new PIXI.Text('Ad banner object');
    this._titleText.style = {
        fill: "white",
        font: "bold 18px Arial",
    };
    this._titleText.position.x = this.getDefaultWidth() / 2 - this._titleText.width / 2;

    this._text = new PIXI.Text('displayed on Android at the top or bottom of the screen');
    this._text.style = {
        fill: "white",
        font: "italic 14px Arial",
    };
    this._text.position.x = this.getDefaultWidth() / 2 - this._text.width / 2;
    this._text.position.y = 30;


    this._placeholder = new PIXI.Graphics();
	this._placeholder.beginFill(0x15B4F9);
	this._placeholder.lineStyle(1, 0x12286F, 1);
	this._placeholder.moveTo(0, 0);
    this._placeholder.lineTo(this.getDefaultWidth(), 0);
    this._placeholder.lineTo(this.getDefaultWidth(), this.getDefaultHeight());
    this._placeholder.lineTo(0, this.getDefaultHeight());
    this._placeholder.lineTo(0, 0);
    this._placeholder.endFill();

    this._pixiObject.addChild(this._placeholder);
    this._pixiObject.addChild(this._text);
    this._pixiObject.addChild(this._titleText);
}
RenderedAdMobInstance.prototype = Object.create( RendereredInstance.prototype );

/**
 * Return a URL for thumbnail of the specified object.
 * @method getThumbnail
 * @static
 */
RenderedAdMobInstance.getThumbnail = function(project, layout, object) {
    return "JsPlatform/Extensions/admobicon24.png";
};

RenderedAdMobInstance.prototype.update = function() {
    this._pixiObject.position.x = this._instance.getX();
    this._pixiObject.position.y = this._instance.getY();
};

RenderedAdMobInstance.prototype.getDefaultWidth = function() {
    return 400;
};

RenderedAdMobInstance.prototype.getDefaultHeight = function() {
    return 64;
};


/**
 * A service containing functions that are called to render instances of objects in a PIXI.Stage.
 * Mainly used by "scenearea" directive and its associated controller.
 *
 * Call registerObject to add a new function to render a type of object.
 *
 * TODO: The module should be renamed InstancesRenderingService
 */
export default {
    renderers: {
        "unknownObjectType" : RenderedUnknownInstance,
        "Sprite" : RenderedSpriteInstance,
        "TiledSpriteObject::TiledSprite" : RenderedTiledSpriteInstance,
        "AdMobObject::AdMob" : RenderedAdMobInstance,
        "TextObject::Text" : RenderedTextInstance
    },
    getThumbnail: function(project, layout, object) {
        var objectType = object.getType();
        if (this.renderers.hasOwnProperty(objectType))
            return this.renderers[objectType].getThumbnail(project, layout, object);
        else
            return this.renderers["unknownObjectType"].getThumbnail(project, layout, object);
    },
    createNewInstanceRenderer: function(project, layout, instance, associatedObject, pixiContainer) {
        var objectType = associatedObject.getType();
        if (this.renderers.hasOwnProperty(objectType))
            return new this.renderers[objectType](project, layout, instance, associatedObject, pixiContainer, this);
        else
            return new this.renderers["unknownObjectType"](project, layout, instance, associatedObject, pixiContainer, this);
    },
    registerInstanceRenderer: function(objectType, renderFunction) {
        if ( !this.renderers.hasOwnProperty(objectType) ){
            console.warn("Tried to register renderer for object \""+objectType+"\", but a renderer already exists.");
            return;
        }

        this.renderers[objectType] = renderFunction;
    }
};
