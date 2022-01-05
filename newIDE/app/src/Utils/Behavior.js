// @flow
import newNameGenerator from './NewNameGenerator';
import Window from './Window';

const gd: libGDevelop = global.gd;

export const hasBehaviorWithType = (object: gdObject, type: string) => {
  const allBehaviorNames = object.getAllBehaviorNames().toJSArray();

  return allBehaviorNames
    .map(behaviorName => object.getBehavior(behaviorName))
    .map(behavior => behavior.getTypeName())
    .filter(behaviorType => behaviorType === type).length;
};

export const addBehaviorToObject = (
  project: gdProject,
  object: gdObject,
  type: string,
  defaultName: string
) => {
  if (hasBehaviorWithType(object, type)) {
    const answer = Window.showConfirmDialog(
      "There is already a behavior of this type attached to the object. It's possible to add this behavior again, but it's unusual and may not be always supported properly. Are you sure you want to add this behavior again?"
    );

    if (!answer) return;
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
};

export const listObjectBehaviorsTypes = (object: gdObject): Array<string> =>
  object
    .getAllBehaviorNames()
    .toJSArray()
    .map(behaviorName => object.getBehavior(behaviorName).getTypeName());
