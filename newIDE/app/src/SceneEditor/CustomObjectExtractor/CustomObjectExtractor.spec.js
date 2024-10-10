// @flow
import { extractAsCustomObject } from './CustomObjectExtractor';
import { makeTestProject } from '../../fixtures/TestProject';
import Rectangle from '../../Utils/Rectangle';
import { getInstancesInLayoutForObject } from '../../Utils/Layout';

const gd: libGDevelop = global.gd;

describe('CustomObjectExtractor', () => {
  it('can extract 2 instances as a custom object', () => {
    const { project, testLayout } = makeTestProject(gd);

    const initialInstances = testLayout.getInitialInstances();
    const otherInstancesCount = initialInstances.getInstancesCount();
    const leftInstance = initialInstances.insertNewInitialInstance();
    leftInstance.setObjectName('MySpriteObject');
    leftInstance.setX(200);
    leftInstance.setY(500);
    leftInstance.setCustomWidth(100);
    leftInstance.setCustomHeight(150);
    const rightInstance = initialInstances.insertNewInitialInstance();
    rightInstance.setObjectName('MySpriteObject');
    rightInstance.setX(300);
    rightInstance.setY(500);
    rightInstance.setCustomWidth(100);
    rightInstance.setCustomHeight(120);
    const selectedInstances = [leftInstance, rightInstance];

    const deleteSelection = () => {
      initialInstances.removeInstance(leftInstance);
      initialInstances.removeInstance(rightInstance);
    };

    extractAsCustomObject({
      project,
      globalObjects: project.getObjects(),
      sceneObjects: testLayout.getObjects(),
      initialInstances,
      chosenExtensionName: 'MyExtension',
      isNewExtension: true,
      chosenEventsBasedObjectName: 'MyCustomObject',
      shouldRemoveSceneObjectsWhenNoMoreInstance: true,
      selectedInstances,
      selectionAABB: new Rectangle(200, 500, 400, 650),
      deleteSelection,
      onExtractAsEventBasedObject: (
        extensionName: string,
        eventsBasedObjectName: string
      ) => {},
    });

    expect(project.hasEventsFunctionsExtensionNamed('MyExtension')).toBe(true);

    const eventsBasedObjects = project
      .getEventsFunctionsExtension('MyExtension')
      .getEventsBasedObjects();
    expect(eventsBasedObjects.has('MyCustomObject')).toBe(true);

    const eventsBasedObject = eventsBasedObjects.get('MyCustomObject');
    expect(eventsBasedObject.getAreaMinX()).toBe(0);
    expect(eventsBasedObject.getAreaMinY()).toBe(0);
    expect(eventsBasedObject.getAreaMaxX()).toBe(200);
    expect(eventsBasedObject.getAreaMaxY()).toBe(150);

    const childObjects = eventsBasedObject.getObjects();
    expect(childObjects.hasObjectNamed('MySpriteObject')).toBe(true);
    expect(childObjects.getObjectsCount()).toBe(1);

    const childrenInstancesContainer = eventsBasedObject.getInitialInstances();
    expect(childrenInstancesContainer.getInstancesCount()).toBe(2);

    const childrenInstances = getInstancesInLayoutForObject(
      childrenInstancesContainer,
      'MySpriteObject'
    );
    expect(childrenInstances.length).toBe(2);

    const leftChildInstance = childrenInstances[0];
    expect(leftChildInstance.getX()).toBe(0);
    expect(leftChildInstance.getY()).toBe(0);
    expect(leftChildInstance.getCustomWidth()).toBe(100);
    expect(leftChildInstance.getCustomHeight()).toBe(150);

    const rightChildInstance = childrenInstances[1];
    expect(rightChildInstance.getX()).toBe(100);
    expect(rightChildInstance.getY()).toBe(0);
    expect(rightChildInstance.getCustomWidth()).toBe(100);
    expect(rightChildInstance.getCustomHeight()).toBe(120);

    expect(testLayout.getObjects().hasObjectNamed('MyCustomObject')).toBe(true);
    const customObject = testLayout.getObjects().getObject('MyCustomObject');
    expect(customObject.getType()).toBe('MyExtension::MyCustomObject');

    // The 2 instances were removed and replaced by an instance of the new custom object.
    expect(initialInstances.getInstancesCount()).toBe(otherInstancesCount + 1);

    const customObjectInstances = getInstancesInLayoutForObject(
      initialInstances,
      'MyCustomObject'
    );
    expect(customObjectInstances.length).toBe(1);
    const customObjectInstance = customObjectInstances[0];
    expect(customObjectInstance.getObjectName()).toBe('MyCustomObject');
    expect(customObjectInstance.getX()).toBe(200);
    expect(customObjectInstance.getY()).toBe(500);
  });
});
