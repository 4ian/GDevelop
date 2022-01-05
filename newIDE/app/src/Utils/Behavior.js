// @flow
import newNameGenerator from './NewNameGenerator';
import Window from './Window';

const gd: libGDevelop = global.gd;

export const hasBehaviorWithType = (object: gdObject, type: string) =>
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
  defaultName: string
): boolean => {
  if (hasBehaviorWithType(object, type)) {
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
  return true;
};

export const listObjectBehaviorsTypes = (object: gdObject): Array<string> =>
  object
    .getAllBehaviorNames()
    .toJSArray()
    .map(behaviorName => object.getBehavior(behaviorName).getTypeName());
