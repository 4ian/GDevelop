// @flow
import { unserializeFromJSObject } from '../../Utils/Serializer';
import newNameGenerator from '../../Utils/NewNameGenerator';
import { serializeToJSObject } from '../../Utils/Serializer';
import getObjectByName from '../../Utils/GetObjectByName';
import Rectangle from '../../Utils/Rectangle';

const gd: libGDevelop = global.gd;

export const extractAsCustomObject = ({
  project,
  globalObjects,
  sceneObjects,
  initialInstances,
  chosenExtensionName,
  isNewExtension,
  chosenEventsBasedObjectName,
  shouldRemoveSceneObjectsWhenNoMoreInstance,
  selectedInstances,
  selectionAABB,
  deleteSelection,
  onExtractAsEventBasedObject,
}: {|
  project: gdProject,
  globalObjects: gdObjectsContainer | null,
  sceneObjects: gdObjectsContainer,
  initialInstances: gdInitialInstancesContainer,
  chosenExtensionName: string,
  isNewExtension: boolean,
  chosenEventsBasedObjectName: string,
  shouldRemoveSceneObjectsWhenNoMoreInstance: boolean,
  selectedInstances: Array<gdInitialInstance>,
  selectionAABB: Rectangle,
  deleteSelection: () => void,
  onExtractAsEventBasedObject: (
    extensionName: string,
    eventsBasedObjectName: string
  ) => void,
|}) => {
  let extensionName = chosenExtensionName;
  if (
    isNewExtension ||
    !project.hasEventsFunctionsExtensionNamed(extensionName)
  ) {
    extensionName = newNameGenerator(
      gd.Project.getSafeName(chosenExtensionName),
      name => project.hasEventsFunctionsExtensionNamed(name)
    );
    project.insertNewEventsFunctionsExtension(extensionName, 0);
  }
  const eventsBasedObjects = project
    .getEventsFunctionsExtension(extensionName)
    .getEventsBasedObjects();

  const serializedSelection = selectedInstances.map(instance =>
    serializeToJSObject(instance)
  );

  const eventsBasedObjectName = newNameGenerator(
    gd.Project.getSafeName(chosenEventsBasedObjectName),
    name => eventsBasedObjects.has(name)
  );
  const newEventsBasedObject = eventsBasedObjects.insertNew(
    eventsBasedObjectName,
    eventsBasedObjects.getCount()
  );
  newEventsBasedObject.setAreaMinX(0);
  newEventsBasedObject.setAreaMinY(0);
  newEventsBasedObject.setAreaMinZ(0);
  newEventsBasedObject.setAreaMaxX(selectionAABB.width());
  newEventsBasedObject.setAreaMaxY(selectionAABB.height());
  newEventsBasedObject.setAreaMaxZ(selectionAABB.depth());
  const childObjects = newEventsBasedObject.getObjects();

  let zOrder = 0;
  let layer = '';
  let isRenderedIn3D = null;
  for (const serializedInstance of serializedSelection) {
    const instance = new gd.InitialInstance();
    unserializeFromJSObject(instance, serializedInstance);
    layer = instance.getLayer();
    zOrder = Math.max(zOrder, instance.getZOrder());

    instance.setX(instance.getX() - selectionAABB.left);
    instance.setY(instance.getY() - selectionAABB.top);
    instance.setZ(instance.getZ() - selectionAABB.zMin);
    instance.setLayer('');

    const objectName = instance.getObjectName();
    if (!childObjects.hasObjectNamed(objectName)) {
      const object = getObjectByName(globalObjects, sceneObjects, objectName);
      if (object) {
        if (isRenderedIn3D === null) {
          const objectMetadata = gd.MetadataProvider.getObjectMetadata(
            project.getCurrentPlatform(),
            object.getType()
          );
          isRenderedIn3D = objectMetadata.isRenderedIn3D();
        }
        const serializedObject = serializeToJSObject(object);
        const childObject = childObjects.insertNewObject(
          project,
          object.getType(),
          objectName,
          0
        );
        unserializeFromJSObject(
          childObject,
          serializedObject,
          'unserializeFrom',
          project
        );
      }
    }
    newEventsBasedObject.markAsRenderedIn3D(!!isRenderedIn3D);

    newEventsBasedObject
      .getInitialInstances()
      .insertInitialInstance(instance)
      .resetPersistentUuid();
    instance.delete();
  }
  const customObjectType = gd.PlatformExtension.getObjectFullType(
    extensionName,
    eventsBasedObjectName
  );
  const customObjectNameInScene = newNameGenerator(
    eventsBasedObjectName,
    tentativeNewName => {
      if (globalObjects && globalObjects.hasObjectNamed(tentativeNewName)) {
        return true;
      }
      if (sceneObjects.hasObjectNamed(tentativeNewName)) {
        return true;
      }

      return false;
    }
  );
  sceneObjects.insertNewObject(
    project,
    customObjectType,
    customObjectNameInScene,
    0
  );

  const customObjectInstance = initialInstances.insertNewInitialInstance();
  customObjectInstance.setObjectName(customObjectNameInScene);
  customObjectInstance.setX(selectionAABB.left);
  customObjectInstance.setY(selectionAABB.top);
  customObjectInstance.setZ(selectionAABB.zMin);
  customObjectInstance.setLayer(layer);
  customObjectInstance.setZOrder(zOrder);

  deleteSelection();
  if (shouldRemoveSceneObjectsWhenNoMoreInstance) {
    for (let index = 0; index < childObjects.getObjectsCount(); index++) {
      const childObjectName = childObjects.getObjectAt(index).getName();
      if (!initialInstances.hasInstancesOfObject(childObjectName)) {
        // Global objects won't be removed, but it's fine as they should not be removed.
        sceneObjects.removeObject(childObjectName);
      }
    }
  }

  onExtractAsEventBasedObject(extensionName, eventsBasedObjectName);
};
