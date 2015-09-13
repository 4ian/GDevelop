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

        if (charTyped !== undefined && //Skip some non displayable characters
            charCode !== 8) { //On Firefox, backspace is considered as a character
            that._str += charTyped;
        }

        if (evt.preventDefault) evt.preventDefault();
        return false;
    };
    this._upHandler = function(evt) {
        if (!that._activated) {
            return;
        }

        evt = evt || window.event;
        var charCode = evt.which || evt.keyCode;
        if (charCode === 8) { //Backspace
            that._str = that._str.slice(0, -1);
        }

        if (evt.preventDefault) evt.preventDefault();
        return false;
    };
    this._downHandler = function(evt) {
        evt = evt || window.event;
        var charCode = evt.which || evt.keyCode;

        //Prevent backspace from going to the previous page
        if (charCode === 8) {
            if (evt.preventDefault) evt.preventDefault();
            return false;
        }
    };

    document.addEventListener('keypress', this._pressHandler);
    document.addEventListener('keyup', this._upHandler);
    document.addEventListener('keydown', this._downHandler);
};

gdjs.TextEntryRuntimeObject.prototype = Object.create( gdjs.RuntimeObject.prototype );
gdjs.TextEntryRuntimeObject.thisIsARuntimeObjectConstructor = "TextEntryObject::TextEntry";

gdjs.TextEntryRuntimeObject.prototype.onDeletedFromScene = function(runtimeScene) {
    gdjs.RuntimeObject.prototype.onDeletedFromScene.call(this, runtimeScene);

    document.removeEventListener('keypress', this._pressHandler);
    document.removeEventListener('keyup', this._upHandler);
    document.removeEventListener('keydown', this._downHandler);
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
