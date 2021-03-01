namespace gdjs {
  /**
   * The Cocos2D-JS renderer for the BitmapTextRuntimeObject.
   *
   * The implementation is empty as the object is not supported in Cocos2D-JS for now.
   */
  export class BitmapTextRuntimeObjectCocosRenderer {
    getRendererObject() {}
    onDestroy() {}
    getFontSize() {}
    updateFont() {}
    updateTint() {}
    getTint() {}
    updateScale() {}
    getScale() {}
    updateWrappingWidth() {}
    updateTextContent() {}
    updateAlignment() {}
    updatePosition() {}
    updateAngle() {}
    updateOpacity() {}

    getWidth() {
      return 0;
    }

    getHeight() {
      return 0;
    }
  }

  export const BitmapTextRuntimeObjectRenderer = BitmapTextRuntimeObjectCocosRenderer;
}
