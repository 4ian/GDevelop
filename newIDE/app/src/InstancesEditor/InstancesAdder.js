// @flow
import { roundPosition } from '../Utils/GridHelpers';
import { unserializeFromJSObject } from '../Utils/Serializer';
import { type InstancesEditorSettings } from './InstancesEditorSettings';
const gd: libGDevelop = global.gd;

type Props = {|
  instances: gdInitialInstancesContainer,
  instancesEditorSettings: InstancesEditorSettings,
|};

const roundPositionsToGrid = (
  pos: [number, number],
  instancesEditorSettings: InstancesEditorSettings
): [number, number] => {
  const newPos = pos;

  if (instancesEditorSettings.grid && instancesEditorSettings.snap) {
    roundPosition(
      newPos,
      instancesEditorSettings.gridWidth,
      instancesEditorSettings.gridHeight,
      instancesEditorSettings.gridOffsetX,
      instancesEditorSettings.gridOffsetY,
      instancesEditorSettings.gridType
    );
  } else {
    newPos[0] = Math.round(newPos[0]);
    newPos[1] = Math.round(newPos[1]);
  }

  return newPos;
};

/**
 * Allow to add instances on the scene. Supports "temporary" instances,
 * which are real instances but can be deleted as long as they are not "committed".
 */
export default class InstancesAdder {
  _instances: gdInitialInstancesContainer;
  _temporaryInstances: Array<gdInitialInstance>;
  _instancesEditorSettings: InstancesEditorSettings;
  _zOrderFinder = new gd.HighestZOrderFinder();

  constructor({ instances, instancesEditorSettings }: Props) {
    this._instances = instances;
    this._instancesEditorSettings = instancesEditorSettings;
    this._temporaryInstances = [];
  }

  setInstancesEditorSettings(instancesEditorSettings: InstancesEditorSettings) {
    this._instancesEditorSettings = instancesEditorSettings;
  }

  addSerializedInstances = ({
    position,
    copyReferential,
    serializedInstances,
    preventSnapToGrid = false,
    addInstancesInTheForeground = false,
  }: {|
    position: [number, number],
    copyReferential: [number, number],
    serializedInstances: Array<Object>,
    preventSnapToGrid?: boolean,
    addInstancesInTheForeground?: boolean,
  |}): Array<gdInitialInstance> => {
    this._zOrderFinder.reset();
    this._instances.iterateOverInstances(this._zOrderFinder);
    const sceneForegroundZOrder = this._zOrderFinder.getHighestZOrder() + 1;

    let addedInstancesLowestZOrder = null;

    const newInstances = serializedInstances.map(serializedInstance => {
      const instance = new gd.InitialInstance();
      unserializeFromJSObject(instance, serializedInstance);
      const desiredPosition = [
        instance.getX() - copyReferential[0] + position[0],
        instance.getY() - copyReferential[1] + position[1],
      ];
      const newPos = preventSnapToGrid
        ? desiredPosition
        : roundPositionsToGrid(desiredPosition, this._instancesEditorSettings);
      instance.setX(newPos[0]);
      instance.setY(newPos[1]);
      if (addInstancesInTheForeground) {
        if (
          addedInstancesLowestZOrder === null ||
          addedInstancesLowestZOrder > instance.getZOrder()
        ) {
          addedInstancesLowestZOrder = instance.getZOrder();
        }
      }
      const newInstance = this._instances
        .insertInitialInstance(instance)
        .resetPersistentUuid();
      instance.delete();
      return newInstance;
    });

    if (addInstancesInTheForeground && addedInstancesLowestZOrder !== null) {
      newInstances.forEach(instance => {
        instance.setZOrder(
          instance.getZOrder() -
            // Flow is not happy with addedInstancesLowestZOrder possible null value
            // so 0 is used as a fallback.
            (addedInstancesLowestZOrder || 0) +
            sceneForegroundZOrder
        );
      });
    }

    return newInstances;
  };

  /**
   * Immediately create new instance at the specified position
   * (specified in scene coordinates).
   */
  addInstances = (
    pos: [number, number],
    objectNames: Array<string>,
    layer: string
  ): Array<gdInitialInstance> => {
    this._zOrderFinder.reset();
    this._instances.iterateOverInstances(this._zOrderFinder);
    const zOrder = this._zOrderFinder.getHighestZOrder() + 1;

    const newPos = roundPositionsToGrid(pos, this._instancesEditorSettings);
    const addedInstances = objectNames.map(objectName => {
      const instance: gdInitialInstance = this._instances.insertNewInitialInstance();
      instance.setObjectName(objectName);
      instance.setX(newPos[0]);
      instance.setY(newPos[1]);
      instance.setLayer(layer);
      instance.setZOrder(zOrder);

      return instance;
    });

    return addedInstances;
  };

  /**
   * Create temporary instances at the specified position
   * (specified in scene coordinates).
   */
  createOrUpdateTemporaryInstancesFromObjectNames = (
    pos: [number, number],
    objectNames: Array<string>,
    layer: string
  ) => {
    if (!objectNames.length) return;

    if (!this._temporaryInstances.length) {
      this._createTemporaryInstancesFromObjectNames(pos, objectNames, layer);
    } else {
      this.updateTemporaryInstancePositions(pos);
    }
  };

  _createTemporaryInstancesFromObjectNames = (
    pos: [number, number],
    objectNames: Array<string>,
    layer: string
  ) => {
    this.deleteTemporaryInstances();

    this._zOrderFinder.reset();
    this._instances.iterateOverInstances(this._zOrderFinder);
    const zOrder = this._zOrderFinder.getHighestZOrder() + 1;

    const newPos = roundPositionsToGrid(pos, this._instancesEditorSettings);
    this._temporaryInstances = objectNames.map(objectName => {
      const instance: gdInitialInstance = this._instances.insertNewInitialInstance();
      instance.setObjectName(objectName);
      instance.setX(newPos[0]);
      instance.setY(newPos[1]);
      instance.setLayer(layer);
      instance.setZOrder(zOrder);

      return instance;
    });
  };

  /**
   * Update the temporary instances  positions
   * (specified in scene coordinates). Useful when dragging these instances.
   */
  updateTemporaryInstancePositions = (
    pos: [number, number]
  ): Array<gdInitialInstance> => {
    const newPos = roundPositionsToGrid(pos, this._instancesEditorSettings);
    this._temporaryInstances.forEach(instance => {
      instance.setX(newPos[0]);
      instance.setY(newPos[1]);
    });

    return this._temporaryInstances;
  };

  /**
   * Delete the temporary instances.
   */
  deleteTemporaryInstances() {
    this._temporaryInstances.forEach(instance => {
      this._instances.removeInstance(instance);
    });
    this._temporaryInstances = [];
  }

  /**
   * Consider the temporary instances as not temporary anymore.
   */
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
