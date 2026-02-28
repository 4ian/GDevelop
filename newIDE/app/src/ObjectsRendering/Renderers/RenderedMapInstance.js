// @flow
import RenderedUnknownInstance from './RenderedUnknownInstance';

const gd: libGDevelop = global.gd;

export default class RenderedMapInstance extends RenderedUnknownInstance {
  getDefaultWidth(): number {
    const configuration = gd.castObject(
      // $FlowFixMe[incompatible-exact]
      this._associatedObjectConfiguration,
      gd.ObjectConfiguration
    );
    const properties = configuration.getProperties();
    if (properties.has('width')) {
      const width = parseFloat(properties.get('width').getValue());
      if (Number.isFinite(width) && width > 0) return width;
    }
    return 200;
  }

  getDefaultHeight(): number {
    const configuration = gd.castObject(
      // $FlowFixMe[incompatible-exact]
      this._associatedObjectConfiguration,
      gd.ObjectConfiguration
    );
    const properties = configuration.getProperties();
    if (properties.has('height')) {
      const height = parseFloat(properties.get('height').getValue());
      if (Number.isFinite(height) && height > 0) return height;
    }
    return 200;
  }
}
