// @flow
import { roundPosition } from '../Utils/GridHelpers';
import ObjectsAdditionalService from '../SceneEditor/ObjectsAdditionalService';
import { type InfoBarDetails } from '../SceneEditor/ObjectsAdditionalService';
const gd: libGDevelop = global.gd;

type Props = {|
  instances: gdInitialInstancesContainer,
  options: Object,
  onAdditionalServiceComplete: (infoBarDetails: InfoBarDetails) => void,
|};

const roundPositionsToGrid = (
  pos: [number, number],
  options: Object
): [number, number] => {
  const newPos = pos;

  if (options.grid && options.snap) {
    newPos[0] = roundPosition(
      newPos[0],
      options.gridWidth,
      options.gridOffsetX
    );
    newPos[1] = roundPosition(
      newPos[1],
      options.gridHeight,
      options.gridOffsetY
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
  _onAdditionalServiceComplete: (infobarDetails: InfoBarDetails) => void;
  _options: Object;
  _zOrderFinder = new gd.HighestZOrderFinder();

  constructor({ instances, options, onAdditionalServiceComplete }: Props) {
    this._instances = instances;
    this._options = options;
    this._temporaryInstances = [];
    this._onAdditionalServiceComplete = onAdditionalServiceComplete;
  }

  setOptions(options: Object) {
    this._options = options;
  }

  onAddInstanceAdditionalservice = (
    instance: gdInitialInstance,
    project: gdProject,
    layout: gdLayout
  ) => {
    const additionalService = ObjectsAdditionalService.getServices(
      instance,
      layout,
      true
    );
    if (additionalService) {
      additionalService.onInstanceAdded(instance, project, layout);
      const infoBarDetails = additionalService.getInfoBarDetails(
        'onInstanceAdded'
      );
      if (infoBarDetails) {
        this._onAdditionalServiceComplete(infoBarDetails);
      }
    }
  };

  /**
   * Immediately create new instance at the specified position
   * (specified in scene coordinates).
   */
  addInstances = (
    pos: [number, number],
    objectNames: Array<string>,
    project: gdProject,
    layout: gdLayout
  ) => {
    this._instances.iterateOverInstances(this._zOrderFinder);
    const zOrder = this._zOrderFinder.getHighestZOrder() + 1;

    const newPos = roundPositionsToGrid(pos, this._options);
    objectNames.map(objectName => {
      const instance: gdInitialInstance = this._instances.insertNewInitialInstance();
      instance.setObjectName(objectName);
      instance.setX(newPos[0]);
      instance.setY(newPos[1]);
      instance.setZOrder(zOrder);

      this.onAddInstanceAdditionalservice(instance, project, layout);

      return instance;
    });
  };

  /**
   * Create temporary instances at the specified position
   * (specified in scene coordinates).
   */
  createOrUpdateTemporaryInstancesFromObjectNames = (
    pos: [number, number],
    objectNames: Array<string>,
    project: gdProject,
    layout: gdLayout
  ) => {
    if (!objectNames.length) return;

    if (!this._temporaryInstances.length) {
      this._createTemporaryInstancesFromObjectNames(
        pos,
        objectNames,
        project,
        layout
      );
    } else {
      this.updateTemporaryInstancePositions(pos);
    }
  };

  _createTemporaryInstancesFromObjectNames = (
    pos: [number, number],
    objectNames: Array<string>,
    project: gdProject,
    layout: gdLayout
  ) => {
    this.deleteTemporaryInstances();

    this._instances.iterateOverInstances(this._zOrderFinder);
    const zOrder = this._zOrderFinder.getHighestZOrder() + 1;

    const newPos = roundPositionsToGrid(pos, this._options);
    this._temporaryInstances = objectNames.map(objectName => {
      const instance: gdInitialInstance = this._instances.insertNewInitialInstance();
      instance.setObjectName(objectName);
      instance.setX(newPos[0]);
      instance.setY(newPos[1]);
      instance.setZOrder(zOrder);

      this.onAddInstanceAdditionalservice(instance, project, layout);

      return instance;
    });
  };

  /**
   * Update the temporary instances  positions
   * (specified in scene coordinates). Useful when dragging these instances.
   */
  updateTemporaryInstancePositions = (pos: [number, number]) => {
    const newPos = roundPositionsToGrid(pos, this._options);
    this._temporaryInstances.forEach(instance => {
      instance.setX(Math.round(newPos[0]));
      instance.setY(Math.round(newPos[1]));
    });
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
