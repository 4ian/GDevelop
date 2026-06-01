// @flow
import { enumerateObjectVariableTabs } from './UnifiedVariablesDialogTabs';

const makeObject = (name: string, variablesCount: number = 0): any => {
  const variables = {
    id: `${name}-variables`,
    count: () => variablesCount,
  };
  return {
    getName: () => name,
    getVariables: () => variables,
  };
};

const makeObjectsContainer = (objects: Array<any>): any => ({
  getObjectsCount: () => objects.length,
  getObjectAt: (index: number) => objects[index],
});

const makeObjectsContainersList = (containers: Array<any>): any => ({
  getObjectsContainersCount: () => containers.length,
  getObjectsContainer: (index: number) => containers[index],
});

const makeProjectScopedContainersAccessor = (
  objectsContainersList: any
): any => ({
  get: () => ({
    getObjectsContainersList: () => objectsContainersList,
  }),
});

describe('VariablesList/UnifiedVariablesDialogTabs', () => {
  it('orders object variable tabs by variables count', () => {
    const sceneObject = makeObject('Player', 4);
    const emptySceneObject = makeObject('Platform', 2);
    const globalObject = makeObject('GameManager', 1);
    const objectsContainersList = makeObjectsContainersList([
      makeObjectsContainer([globalObject]),
      makeObjectsContainer([sceneObject, emptySceneObject]),
    ]);
    const initialInstances = {};

    const tabs = enumerateObjectVariableTabs({
      projectScopedContainersAccessor: makeProjectScopedContainersAccessor(
        objectsContainersList
      ),
      initialInstances: ((initialInstances: any): gdInitialInstancesContainer),
    });

    expect(tabs).toEqual([
      {
        id: 'object-variables-1-Player',
        objectName: 'Player',
        variablesContainer: sceneObject.getVariables(),
        initialInstances,
      },
      {
        id: 'object-variables-1-Platform',
        objectName: 'Platform',
        variablesContainer: emptySceneObject.getVariables(),
        initialInstances,
      },
      {
        id: 'object-variables-0-GameManager',
        objectName: 'GameManager',
        variablesContainer: globalObject.getVariables(),
        initialInstances,
      },
    ]);
  });
});
