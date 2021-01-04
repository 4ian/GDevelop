/*
 *  GDevelop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * The TextEntryRuntimeObject allows to capture text typed on the keyboard.
 *
 * @class TextEntryRuntimeObject
 * @extends RuntimeObject
 * @memberof gdjs
 * @param {gdjs.RuntimeScene} runtimeScene The {@link gdjs.RuntimeScene} the object belongs to
 * @param {ObjectData} textEntryObjectData The initial properties of the object
 */
gdjs.TextEntryRuntimeObject = function(runtimeScene, textEntryObjectData)
{
    gdjs.RuntimeObject.call(this, runtimeScene, textEntryObjectData);

    /** @type {string} */
    this._str = "";

    /** @type {boolean} */
    this._activated = true;

    if (this._renderer)
        gdjs.TextEntryRuntimeObjectRenderer.call(this._renderer, this, runtimeScene);
    else
        /** @type {gdjs.TextEntryRuntimeObjectRenderer} */
        this._renderer = new gdjs.TextEntryRuntimeObjectRenderer(this, runtimeScene);

    // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
    this.onCreated();
};

gdjs.TextEntryRuntimeObject.prototype = Object.create( gdjs.RuntimeObject.prototype );
gdjs.registerObject("TextEntryObject::TextEntry", gdjs.TextEntryRuntimeObject);

gdjs.TextEntryRuntimeObject.prototype.updateFromObjectData = function(oldObjectData, newObjectData) {
    // Nothing to update.
    return true;
}

gdjs.TextEntryRuntimeObject.prototype.onDestroyFromScene = function(runtimeScene) {
    gdjs.RuntimeObject.prototype.onDestroyFromScene.call(this, runtimeScene);

    if (this._renderer.onDestroy) {
        this._renderer.onDestroy();
    }
};

gdjs.TextEntryRuntimeObject.prototype.update = function() {
    if (this._renderer.getString) {
        this._str = this._renderer.getString();
    }
};

gdjs.TextEntryRuntimeObject.prototype.getString = function() {
    return this._str;
};

gdjs.TextEntryRuntimeObject.prototype.setString = function(str) {
    this._str = str;
    this._renderer.updateString();
};

gdjs.TextEntryRuntimeObject.prototype.isActivated = function() {
    return this._activated;
};

gdjs.TextEntryRuntimeObject.prototype.activate = function(enable) {
    this._activated = enable;
    this._renderer.activate(this._activated);
};
