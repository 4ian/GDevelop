// @flow
import { mapFor } from './MapFor';
import { isCollectionVariable } from './VariablesUtils';

const gd: libGDevelop = global.gd;

export type SimplifiedBehavior = {|
  behaviorName: string,
  behaviorType: string,
|};

type SimplifiedVariable = {|
  variableName: string,
  type: string,
  value?: string,
  variableChildren?: Array<SimplifiedVariable>,
|};

type SimplifiedObject = {|
  objectName: string,
  objectType: string,
  behaviors?: Array<SimplifiedBehavior>,
  objectVariables?: Array<SimplifiedVariable>,
|};

type SimplifiedScene = {|
  sceneName: string,
  objects: Array<SimplifiedObject>,
  sceneVariables: Array<SimplifiedVariable>,
|};

type SimplifiedProject = {|
  globalObjects: Array<SimplifiedObject>,
  scenes: Array<SimplifiedScene>,
  globalVariables: Array<SimplifiedVariable>,
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

const getSimplifiedVariable = (
  name: string,
  variable: gdVariable,
  depth = 0
): SimplifiedVariable => {
  const isCollection = isCollectionVariable(variable);

  if (isCollection) {
    // Don't diplay children of arrays, and only display the first level of children of structures.
    if (variable.getType() === gd.Variable.Structure && depth === 0) {
      return {
        variableName: name,
        type: getVariableType(variable),
        variableChildren: variable
          .getAllChildrenNames()
          .toJSArray()
          .map(childName => {
            const childVariable = variable.getChild(childName);
            return getSimplifiedVariable(childName, childVariable, depth + 1);
          }),
      };
    }
    return {
      variableName: name,
      type: getVariableType(variable),
    };
  }

  return {
    variableName: name,
    type: getVariableType(variable),
    value: getVariableValueAsString(variable),
  };
};

const getSimplifiedVariablesContainerJson = (
  container: gdVariablesContainer
): Array<SimplifiedVariable> => {
  return mapFor(0, Math.min(container.count(), 20), (index: number) => {
    const name = container.getNameAt(index);
    const variable = container.getAt(index);
    return getSimplifiedVariable(name, variable);
  }).filter(Boolean);
};

const getSimplifiedObject = (object: gdObject): SimplifiedObject => {
  const objectVariables = getSimplifiedVariablesContainerJson(
    object.getVariables()
  );
  const behaviors = object
    .getAllBehaviorNames()
    .toJSArray()
    .map(behaviorName => {
      const behavior = object.getBehavior(behaviorName);
      if (behavior.isDefaultBehavior()) return null;
      return getSimplifiedBehaviorJson(behavior);
    })
    .filter(Boolean);

  const simplifiedObject: SimplifiedObject = {
    objectName: object.getName(),
    objectType: object.getType(),
  };

  if (behaviors.length > 0) {
    simplifiedObject.behaviors = behaviors;
  }
  if (objectVariables.length > 0) {
    simplifiedObject.objectVariables = objectVariables;
  }

  return simplifiedObject;
};

const getSimplifiedObjectsJson = (
  objects: gdObjectsContainer
): Array<SimplifiedObject> => {
  return mapFor(0, objects.getObjectsCount(), i => {
    const object = objects.getObjectAt(i);
    return getSimplifiedObject(object);
  });
};

const getSimplifiedScene = (scene: gdLayout) => {
  return {
    sceneName: scene.getName(),
    objects: getSimplifiedObjectsJson(scene.getObjects()),
    sceneVariables: getSimplifiedVariablesContainerJson(scene.getVariables()),
  };
};

export type SimplifiedProjectOptions = {|
  scopeToScene?: string,
|};

export const getSimplifiedProject = (
  project: gdProject,
  options: SimplifiedProjectOptions
): SimplifiedProject => {
  const globalObjects = getSimplifiedObjectsJson(project.getObjects());
  const scenes = mapFor(0, project.getLayoutsCount(), i => {
    const scene = project.getLayoutAt(i);
    if (options.scopeToScene && scene.getName() !== options.scopeToScene)
      return null;

    return getSimplifiedScene(scene);
  }).filter(Boolean);

  return {
    globalObjects,
    scenes,
    globalVariables: getSimplifiedVariablesContainerJson(
      project.getVariables()
    ),
  };
};
