// @flow
import RenderedInstance from './RenderedInstance';

/**
 * RenderedInstanceWithCustomizableCenter is a derivative of RenderedInstance
 * that represents an instance whose center can be custom (not at the center of
 * the AABB of the object).
 */
export default class RenderedInstanceWithCustomizableCenter extends RenderedInstance {
  getCenterX() {
    return this.getDefaultWidth() / 2;
  }

  getCenterY() {
    return this.getDefaultHeight() / 2;
  }
}
