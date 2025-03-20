// @flow
import { mapFor } from './MapFor';

type SimplifiedBehaviorJson = {|
  behaviorName: string,
  behaviorType: string,
|};

type SimplifiedObjectJson = {|
  objectName: string,
  objectType: string,
  behaviors: Array<SimplifiedBehaviorJson>,
|};

type SimplifiedSceneJson = {|
  sceneName: string,
  objects: Array<SimplifiedObjectJson>,
|};

type SimplifiedProjectJson = {|
  globalObjects: Array<SimplifiedObjectJson>,
  scenes: Array<SimplifiedSceneJson>,
|};

const getSimplifiedBehaviorJson = (behavior: gdBehavior) => {
  return {
    behaviorName: behavior.getName(),
    behaviorType: behavior.getTypeName(),
  };
};

const getSimplifiedObjectJson = (object: gdObject) => {
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
  };
};
