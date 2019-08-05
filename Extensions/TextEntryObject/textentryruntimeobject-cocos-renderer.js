gdjs.TextEntryRuntimeObjectCocosRenderer = function(runtimeObject, runtimeScene)
{
    this._object = runtimeObject;
    this._textField = new cc.TextFieldTTF('', cc.size(500,150), cc.TEXT_ALIGNMENT_LEFT,"Arial", 32);
    this._textField.setOpacity(0);

    var renderer = runtimeScene.getLayer("").getRenderer();
    renderer.addRendererObject(this._textField, runtimeObject.getZOrder());

    this.updateString();
};

gdjs.TextEntryRuntimeObjectRenderer = gdjs.TextEntryRuntimeObjectCocosRenderer; //Register the class to let the engine use it.

gdjs.TextEntryRuntimeObjectCocosRenderer.prototype.onDestroy = function() {
    this.activate(false);
};

gdjs.TextEntryRuntimeObjectCocosRenderer.prototype.getRendererObject = function() {
    return this._textField;
};

gdjs.TextEntryRuntimeObjectCocosRenderer.prototype.getString = function() {
    return this._textField.getString();
}

gdjs.TextEntryRuntimeObjectCocosRenderer.prototype.updateString = function() {
    this._textField.setString(this._object.getString());
}

gdjs.TextEntryRuntimeObjectCocosRenderer.prototype.activate = function(enable) {
    if (enable) {
        this._textField.attachWithIME();
    } else {
        this._textField.detachWithIME();
    }
}
