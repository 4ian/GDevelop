namespace gdjs {
  class TextEntryRuntimeObjectCocosRenderer {
    _object: any;
    _textField: any;

    constructor(runtimeObject, runtimeScene) {
      this._object = runtimeObject;
      this._textField = new cc.TextFieldTTF(
        '',
        cc.size(500, 150),
        cc.TEXT_ALIGNMENT_LEFT,
        'Arial',
        32
      );
      this._textField.setOpacity(0);
      const renderer = runtimeScene.getLayer('').getRenderer();
      renderer.addRendererObject(this._textField, runtimeObject.getZOrder());
      this.updateString();
    }

    onDestroy() {
      this.activate(false);
    }

    getRendererObject() {
      return this._textField;
    }

    getString(): string {
      return this._textField.getString();
    }

    updateString(): void {
      this._textField.setString(this._object.getString());
    }

    activate(enable) {
      if (enable) {
        this._textField.attachWithIME();
      } else {
        this._textField.detachWithIME();
      }
    }
  }

  // @ts-ignore - Register the class to let the engine use it.
  gdjs.TextEntryRuntimeObjectRenderer = TextEntryRuntimeObjectCocosRenderer;
}
