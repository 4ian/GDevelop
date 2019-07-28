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
 */
gdjs.TextEntryRuntimeObject = function(runtimeScene, objectData)
{
    gdjs.RuntimeObject.call(this, runtimeScene, objectData);
    this._str = "";
    this._activated = true;

    if (this._renderer)
        gdjs.TextEntryRuntimeObjectRenderer.call(this._renderer, this, runtimeScene);
    else
        this._renderer = new gdjs.TextEntryRuntimeObjectRenderer(this, runtimeScene);

    // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
    this.onCreated();
};

gdjs.TextEntryRuntimeObject.prototype = Object.create( gdjs.RuntimeObject.prototype );
gdjs.TextEntryRuntimeObject.thisIsARuntimeObjectConstructor = "TextEntryObject::TextEntry";

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

gdjs.TextEntryRuntimeObject.prototype.setLayer = function(layer) {
     // No renderable object
};

gdjs.TextEntryRuntimeObject.prototype.setZOrder = function(z) {
     // No renderable object
};
