// @flow
import { mapFor } from '../Utils/MapFor';
import flatten from 'lodash/flatten';

export type EnumeratedBehaviorMetadata = {|
  extension: gdPlatformExtension,
  behaviorMetadata: gdBehaviorMetadata,
  type: string,
  defaultName: string,
  fullName: string,
  description: string,
  iconFilename: string,
|};

export const enumerateBehaviorsMetadata = (
  platform: gdPlatform,
  project: gdProject
): Array<EnumeratedBehaviorMetadata> => {
  const extensionsList = platform.getAllPlatformExtensions();

  return flatten(
    mapFor(0, extensionsList.size(), i => {
      const extension = extensionsList.at(i);

      return extension
        .getBehaviorsTypes()
        .toJSArray()
        .map(behaviorType => ({
          behaviorType,
          behaviorMetadata: extension.getBehaviorMetadata(behaviorType),
        }))
        .map(({ behaviorType, behaviorMetadata }) => ({
          extension,
          behaviorMetadata,
          type: behaviorType,
          defaultName: behaviorMetadata.getDefaultName(),
          fullName: behaviorMetadata.getFullName(),
          description: behaviorMetadata.getDescription(),
          iconFilename: behaviorMetadata.getIconFilename(),
        }));
    })
  );
};
