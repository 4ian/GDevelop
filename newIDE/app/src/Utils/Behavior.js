// @flow
import newNameGenerator from './NewNameGenerator';
import Window from './Window';

const gd: libGDevelop = global.gd;

export const hasBehaviorWithType = (object: gdObject, type: string): number =>
  object
    .getAllBehaviorNames()
    .toJSArray()
    .filter(
      behaviorName => object.getBehavior(behaviorName).getTypeName() === type
    ).length;

export const addBehaviorToObject = (
  project: gdProject,
  object: gdObject,
  type: string,
  defaultName: string,
  shouldSkipExistingBehaviorSilently: boolean
): boolean => {
  if (hasBehaviorWithType(object, type)) {
    if (shouldSkipExistingBehaviorSilently) {
      return false;
    }
    const answer = Window.showConfirmDialog(
      "There is already a behavior of this type attached to the object. It's possible to add this behavior again, but it's unusual and may not always be supported properly. Are you sure you want to add this behavior again?"
    );

    if (!answer) return false;
  }

  const name = newNameGenerator(defaultName, name =>
    object.hasBehaviorNamed(name)
  );
  gd.WholeProjectRefactorer.addBehaviorAndRequiredBehaviors(
    project,
    object,
    type,
    name
  );

  // Show the behavior properties in the editor by default, when just added.
  object.getBehavior(name).setFolded(false);

  return true;
};

export const listObjectBehaviorsTypes = (object: gdObject): Array<string> =>
  object
    .getAllBehaviorNames()
    .toJSArray()
    .map(behaviorName => object.getBehavior(behaviorName).getTypeName());

export const listObjectsBehaviorsTypes = (
  objects: Array<gdObject>
): Array<string> =>
  objects.length === 0
    ? []
    : objects[0]
        .getAllBehaviorNames()
        .toJSArray()
        .filter(behaviorName =>
          objects.every(object => object.hasBehaviorNamed(behaviorName))
        )
        .map(behaviorName =>
          objects[0].getBehavior(behaviorName).getTypeName()
        );

export const getAllVisibleBehaviorNames = (
  objects: Array<gdObject>
): Array<string> =>
  objects.length === 0
    ? []
    : objects[0]
        .getAllBehaviorNames()
        .toJSArray()
        .filter(
          behaviorName =>
            // As for now, any default behavior is hidden,
            // it avoids to get behavior metadata to check the "hidden" flag.
            !objects[0].getBehavior(behaviorName).isDefaultBehavior() &&
            objects.every(object => object.hasBehaviorNamed(behaviorName))
        );
