// @flow
import { mapFor } from './MapFor';
import { isCollectionVariable } from './VariablesUtils';

const gd: libGDevelop = global.gd;

type SimplifiedBehaviorJson = {|
  behaviorName: string,
  behaviorType: string,
|};

type SimplifiedVariableJson = {|
  variableName: string,
  type: string,
  value?: string,
  children: ?Array<SimplifiedVariableJson>,
|};

type SimplifiedObjectJson = {|
  objectName: string,
  objectType: string,
  behaviors: Array<SimplifiedBehaviorJson>,
  objectVariables: Array<SimplifiedVariableJson>,
|};

type SimplifiedSceneJson = {|
  sceneName: string,
  objects: Array<SimplifiedObjectJson>,
  sceneVariables: Array<SimplifiedVariableJson>,
|};

type SimplifiedProjectJson = {|
  globalObjects: Array<SimplifiedObjectJson>,
  scenes: Array<SimplifiedSceneJson>,
  globalVariables: Array<SimplifiedVariableJson>,
|};

const getSimplifiedBehaviorJson = (behavior: gdBehavior) => {
  return {
    behaviorName: behavior.getName(),
    behaviorType: behavior.getTypeName(),
  };
};

const getVariableType = (variable: gdVariable) => {
  const type = variable.getType();
  return type === gd.Variable.String
    ? 'String'
    : type === gd.Variable.Number
    ? 'Number'
    : type === gd.Variable.Boolean
    ? 'Boolean'
    : type === gd.Variable.Structure
    ? 'Structure'
    : type === gd.Variable.Array
    ? 'Array'
    : 'unknown';
};

const getVariableValueAsString = (variable: gdVariable) => {
  const type = variable.getType();
  return type === gd.Variable.Structure || type === gd.Variable.Array
    ? variable.getChildrenCount() === 0
      ? `No children`
      : variable.getChildrenCount() === 1
      ? `1 child`
      : `${variable.getChildrenCount()} children`
    : type === gd.Variable.String
    ? variable.getString()
    : type === gd.Variable.Number
    ? variable.getValue().toString()
    : type === gd.Variable.Boolean
    ? variable.getBool()
      ? `True`
      : `False`
    : 'unknown';
};

const getSimplifiedVariableJson = (
  name: string,
  variable: gdVariable,
  depth = 0
): SimplifiedVariableJson => {
  const isCollection = isCollectionVariable(variable);

  // Don't diplay children of arrays, and only display the first level of children of structures.
  const shouldDisplayChildren =
    variable.getType() === gd.Variable.Structure && depth === 0;

  return {
    variableName: name,
    type: getVariableType(variable),
    value: !isCollection ? getVariableValueAsString(variable) : undefined,
    children: shouldDisplayChildren
      ? variable
          .getAllChildrenNames()
          .toJSArray()
          .map(childName => {
            const childVariable = variable.getChild(childName);
            return getSimplifiedVariableJson(
              childName,
              childVariable,
              depth + 1
            );
          })
          .filter(Boolean)
      : undefined,
  };
};

const getSimplifiedVariablesContainerJson = (
  container: gdVariablesContainer
): Array<SimplifiedVariableJson> => {
  return mapFor(0, Math.min(container.count(), 20), (index: number) => {
    const name = container.getNameAt(index);
    const variable = container.getAt(index);
    return getSimplifiedVariableJson(name, variable);
  }).filter(Boolean);
};

const getSimplifiedObjectJson = (object: gdObject): SimplifiedObjectJson => {
  return {
    objectName: object.getName(),
    objectType: object.getType(),
    behaviors: object
      .getAllBehaviorNames()
      .toJSArray()
      .map(behaviorName => {
        const behavior = object.getBehavior(behaviorName);
        if (behavior.isDefaultBehavior()) return null;
        return getSimplifiedBehaviorJson(behavior);
      })
      .filter(Boolean),
    objectVariables: getSimplifiedVariablesContainerJson(object.getVariables()),
  };
};

const getSimplifiedObjectsJson = (
  objects: gdObjectsContainer
): Array<SimplifiedObjectJson> => {
  return mapFor(0, objects.getObjectsCount(), i => {
    const object = objects.getObjectAt(i);
    return getSimplifiedObjectJson(object);
  });
};

const getSimplifiedSceneJson = (scene: gdLayout) => {
  return {
    sceneName: scene.getName(),
    objects: getSimplifiedObjectsJson(scene.getObjects()),
    sceneVariables: getSimplifiedVariablesContainerJson(scene.getVariables()),
  };
};

export const getSimplifiedProjectJson = (
  project: gdProject
): SimplifiedProjectJson => {
  const globalObjects = getSimplifiedObjectsJson(project.getObjects());
  const scenes = mapFor(0, project.getLayoutsCount(), i => {
    const scene = project.getLayoutAt(i);
    return getSimplifiedSceneJson(scene);
  });

  return {
    globalObjects,
    scenes,
    globalVariables: getSimplifiedVariablesContainerJson(
      project.getVariables()
    ),
  };
};
