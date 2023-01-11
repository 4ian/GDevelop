// @flow
import RenderedInstance from './RenderedInstance';

/**
 * RenderedInstance is the base class used for creating renderers of instances,
 * which display on the scene editor, using Pixi.js, the instance of an object (see InstancesEditor).
 */
export default class RenderedInstanceWithCustomizableCenter extends RenderedInstance {
  _isCenterCustomizable = true;

  getCenterX() {
    return this.getDefaultWidth() / 2;
  }

  getCenterY() {
    return this.getDefaultHeight() / 2;
  }
}
