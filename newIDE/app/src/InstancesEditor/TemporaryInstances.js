// @flow
import { roundPosition } from '../Utils/GridHelpers';
const gd = global.gd;

type Props = {|
  instances: gdInitialInstancesContainer,
  toSceneCoordinates: (x: number, y: number) => [number, number],
  options: Object,
|};

export default class TemporaryInstances {
  _instances: gdInitialInstancesContainer;
  _toSceneCoordinates: (x: number, y: number) => [number, number];
  _temporaryInstances: Array<gdInitialInstance>;
  _options: Object;
  _zOrderFinder = new gd.HighestZOrderFinder();

  constructor({ instances, toSceneCoordinates, options }: Props) {
    this._instances = instances;
    this._toSceneCoordinates = toSceneCoordinates;
    this._options = options;
    this._temporaryInstances = [];
  }

  setOptions(options: Object) {
    this._options = options;
  }

  createOrUpdateFromObjectNames = (
    x: number,
    y: number,
    objectNames: Array<string>
  ) => {
    if (!objectNames.length) return;

    if (!this._temporaryInstances.length) {
      this._createFromObjectNames(x, y, objectNames);
    } else {
      this.updatePositions(x, y);
    }
  };

  _createFromObjectNames = (
    x: number,
    y: number,
    objectNames: Array<string>
  ) => {
    this.deleteTemporaryInstances();

    this._instances.iterateOverInstances(this._zOrderFinder);
    const zOrder = this._zOrderFinder.getHighestZOrder() + 1;

    const newPos = this._toSceneCoordinates(x, y);
    this._temporaryInstances = objectNames.map(objectName => {
      const instance: gdInitialInstance = this._instances.insertNewInitialInstance();
      instance.setObjectName(objectName);
      instance.setX(newPos[0]);
      instance.setY(newPos[1]);
      instance.setZOrder(zOrder);
      // TODO: Layer here

      return instance;
    });
  };

  updatePositions = (x: number, y: number) => {
    const newPos = this._toSceneCoordinates(x, y);

    if (this._options.grid && this._options.snap) {
      newPos[0] = roundPosition(
        newPos[0],
        this._options.gridWidth,
        this._options.gridOffsetX
      );
      newPos[1] = roundPosition(
        newPos[1],
        this._options.gridHeight,
        this._options.gridOffsetY
      );
    }

    this._temporaryInstances.forEach(instance => {
      instance.setX(newPos[0]);
      instance.setY(newPos[1]);
    });
  };

  deleteTemporaryInstances() {
    this._temporaryInstances.forEach(instance => {
      this._instances.removeInstance(instance);
    });
    this._temporaryInstances = [];
  }

  commitTemporaryInstances() {
    this._temporaryInstances = [];
  }

  unmount() {
    this._zOrderFinder.delete();

    // Nothing to do for temporaries instances, that should have been deleted/commited by this moment.
    // Don't take the risk to delete them now as this._instances might have been deleted/invalidated
    // already.
  }
}
