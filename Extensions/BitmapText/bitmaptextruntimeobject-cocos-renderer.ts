/**
 * The Cocos2D-JS renderer for the BitmapTextRuntimeObject.
 *
 * The implementation is empty as the object is not supported in Cocos2D-JS for now.
 *
 * @class BitmapTextRuntimeObjectCocosRenderer
 * @constructor

 * @param {gdjs.RuntimeScene} runtimeScene The gdjs.RuntimeScene in which the object is
 */

namespace gdjs {
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

  gdjs.BitmapTextRuntimeObjectRenderer =
    gdjs.BitmapTextRuntimeObjectCocosRenderer;
}
