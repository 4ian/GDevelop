gdjs.TextEntryRuntimeObjectPixiRenderer = function(runtimeObject)
{
    this._object = runtimeObject;
    this._pressHandler = function(evt) {
        if (!runtimeObject.isActivated()) {
            return;
        }

        evt = evt || window.event;
        var charCode = evt.which || evt.keyCode;
        var charTyped = String.fromCharCode(charCode);

        if (charTyped !== undefined && //Skip some non displayable characters
            charCode !== 8) { //On Firefox, backspace is considered as a character
            runtimeObject.setString(runtimeObject.getString() + charTyped);
        }

        if (evt.preventDefault) evt.preventDefault();
        return false;
    };
    this._upHandler = function(evt) {
        if (!runtimeObject.isActivated()) {
            return;
        }

        evt = evt || window.event;
        var charCode = evt.which || evt.keyCode;
        if (charCode === 8) { //Backspace
            runtimeObject.setString(runtimeObject.getString().slice(0, -1));
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

gdjs.TextEntryRuntimeObjectRenderer = gdjs.TextEntryRuntimeObjectPixiRenderer; //Register the class to let the engine use it.

gdjs.TextEntryRuntimeObjectPixiRenderer.prototype.onDestroy = function() {
    document.removeEventListener('keypress', this._pressHandler);
    document.removeEventListener('keyup', this._upHandler);
    document.removeEventListener('keydown', this._downHandler);
};

gdjs.TextEntryRuntimeObjectPixiRenderer.prototype.updateString = function() {
    //Nothing to do.
}

gdjs.TextEntryRuntimeObjectPixiRenderer.prototype.activate = function(enable) {
    //Nothing to do.
}
