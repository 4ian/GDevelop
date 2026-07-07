// @flow
import newNameGenerator from './NewNameGenerator';
import Window from './Window';
import { mapFor } from './MapFor';

const gd: libGDevelop = global.gd;

const getBehaviorNamesWithType = (object: any, type: string): Array<string> =>
  object
    .getAllBehaviorNames()
    .toJSArray()
    .filter(
      behaviorName => object.getBehavior(behaviorName).getTypeName() === type
    );

export const hasBehaviorWithType = (object: any, type: string): number =>
  getBehaviorNamesWithType(object, type).length;

export const addRequiredBehaviorsForBehaviorHolder = (
  project: gdProject,
  object: any,
  behaviorName: string
) => {
  if (!object.hasBehaviorNamed(behaviorName)) return;

  const behavior = object.getBehavior(behaviorName);
  const platform = project.getCurrentPlatform();
  const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
    platform,
    behavior.getTypeName()
  );
  if (gd.MetadataProvider.isBadBehaviorMetadata(behaviorMetadata)) {
    return;
  }

  behaviorMetadata
    .getRequiredBehaviorTypes()
    .toJSArray()
    .forEach(requiredBehaviorType => {
      const behaviorNames = getBehaviorNamesWithType(
        object,
        requiredBehaviorType
      );
      let requiredBehaviorName = behaviorNames[0];

      if (!requiredBehaviorName) {
        const requiredBehaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
          platform,
          requiredBehaviorType
        );
        if (
          gd.MetadataProvider.isBadBehaviorMetadata(requiredBehaviorMetadata)
        ) {
          return;
        }

        requiredBehaviorName = requiredBehaviorMetadata.getDefaultName();
        object.addNewBehavior(
          project,
          requiredBehaviorType,
          requiredBehaviorName
        );
        addRequiredBehaviorsForBehaviorHolder(
          project,
          object,
          requiredBehaviorName
        );
      }

      const properties = behavior.getProperties();
      const propertyNames = properties.keys();
      mapFor(0, propertyNames.size(), i => {
        const propertyName = propertyNames.at(i);
        const property = properties.get(propertyName);
        if (property.getType() !== 'Behavior') return;

        const extraInfo = property.getExtraInfo();
        if (
          extraInfo.size() === 0 ||
          extraInfo.at(0) !== requiredBehaviorType
        ) {
          return;
        }

        behavior.updateProperty(propertyName, requiredBehaviorName);
      });
    });
};

export const addBehaviorToObject = (
  project: gdProject,
  object: any,
  type: string,
  defaultName: string,
  options?: {|
    useWholeProjectRefactorer?: boolean,
    shouldSkipExistingBehaviorSilently?: boolean,
  |}
): boolean => {
  if (hasBehaviorWithType(object, type)) {
    if (options && options.shouldSkipExistingBehaviorSilently) {
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
  if (!options || options.useWholeProjectRefactorer !== false) {
    gd.WholeProjectRefactorer.addBehaviorAndRequiredBehaviors(
      project,
      object,
      type,
      name
    );
  } else {
    if (!object.addNewBehavior(project, type, name)) {
      return false;
    }
    addRequiredBehaviorsForBehaviorHolder(project, object, name);
  }

  // Show the behavior properties in the editor by default, when just added.
  if (object.hasBehaviorNamed(name)) {
    object.getBehavior(name).setFolded(false);
  }

  return true;
};

export const listObjectBehaviorsTypes = (object: any): Array<string> =>
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
            (objects.length === 1 ||
              objects.every(object => object.hasBehaviorNamed(behaviorName)))
        );
