/**
 * RenderedInstance represents the object associated to an instance
 * when it is rendered in a scene editor (see SceneAreaCtrl).
 *
 * @class RenderedInstance
 * @constructor
 * @param associatedObject The (layout or global) object that the instance is associated to.
 * @param pixiContainer The PIXI.DisplayObjectContainer where the instance must be rendered
 */
function RenderedInstance(project, layout, instance, associatedObject, pixiContainer) {
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
RenderedInstance.toRad = function(angleInDegrees) {
    return angleInDegrees/180*3.14159;
};

/**
 * Called when the scene editor is rendered.
 * @method update
 */
RenderedInstance.prototype.update = function() {
    //Nothing to do.
};

/**
 * Called to notify the instance renderer that its associated instance was removed from
 * the scene. The PIXI object should probably be removed from the container: This is what
 * the default implementation of the method does.
 * @method instanceRemovedFromScene
 */
RenderedInstance.prototype.instanceRemovedFromScene = function() {
    if (this._pixiObject !== null && this._pixiContainer.children.indexOf(this._pixiObject) !== -1)
        this._pixiContainer.removeChild(this._pixiObject);
};

/**
 * Return the width of the instance when the instance doesn't have a custom size.
 * @method getDefaultWidth
 */
RenderedInstance.prototype.getDefaultWidth = function() {
    return 32;
};

/**
 * Return the height of the instance when the instance doesn't have a custom size.
 * @method getDefaultHeight
 */
RenderedInstance.prototype.getDefaultHeight = function() {
    return 32;
};

export default RenderedInstance;
