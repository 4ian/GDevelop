/*
 *  GDevelop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * The TextEntryRuntimeObject allow to capture .
 *
 * @class TextEntryRuntimeObject
 * @extends RuntimeObject
 * @namespace gdjs
 */
gdjs.TextEntryRuntimeObject = function(runtimeScene, objectData)
{
    gdjs.RuntimeObject.call(this, runtimeScene, objectData);
    this._str = "";
    this._activated = true;

    var that = this;
    this._pressHandler = function(evt) {
        if (!that._activated) {
            return;
        }

        evt = evt || window.event;
        var charCode = evt.which || evt.keyCode;
        var charTyped = String.fromCharCode(charCode);

        if (charTyped !== undefined) { //Skip some non displayable characters
            that._str += charTyped;
        }
    };
    this._upHandler = function(evt) {
        if (!that._activated) {
            return;
        }

        evt = evt || window.event;
        var charCode = evt.which || evt.keyCode;
        if (charCode === 8) { //Backslash
            that._str = that._str.slice(0, -1);
        }
    };

    document.addEventListener('keypress', this._pressHandler);
    document.addEventListener('keyup', this._upHandler);
};

gdjs.TextEntryRuntimeObject.prototype = Object.create( gdjs.RuntimeObject.prototype );
gdjs.TextEntryRuntimeObject.thisIsARuntimeObjectConstructor = "TextEntryObject::TextEntry";

gdjs.TextEntryRuntimeObject.prototype.onDeletedFromScene = function(runtimeScene) {
    document.removeEventListener('keypress', this._pressHandler);
    document.removeEventListener('keyup', this._upHandler);
};

gdjs.TextEntryRuntimeObject.prototype.getString = function() {
    return this._str;
};

gdjs.TextEntryRuntimeObject.prototype.setString = function(str) {
    this._str = str;
};

gdjs.TextEntryRuntimeObject.prototype.isActivated = function() {
    return this._activated;
};

gdjs.TextEntryRuntimeObject.prototype.activate = function(enable) {
    this._activated = enable;
};
