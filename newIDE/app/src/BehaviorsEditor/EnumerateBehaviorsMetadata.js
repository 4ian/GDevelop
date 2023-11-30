// @flow
import { mapFor } from '../Utils/MapFor';
import flatten from 'lodash/flatten';

export type EnumeratedBehaviorMetadata = {|
  extension: gdPlatformExtension,
  behaviorMetadata: gdBehaviorMetadata,
  type: string,
  objectType: string,
  defaultName: string,
  fullName: string,
  description: string,
  previewIconUrl: string,
  category: string,
  tags: Array<string>,
|};

export const enumerateBehaviorsMetadata = (
  platform: gdPlatform,
  project: gdProject,
  eventsFunctionsExtension?: gdEventsFunctionsExtension
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
        .filter(
          ({ behaviorMetadata }) =>
            !behaviorMetadata.isPrivate() ||
            (eventsFunctionsExtension &&
              extension.getName() === eventsFunctionsExtension.getName())
        )
        .map(({ behaviorType, behaviorMetadata }) => ({
          extension,
          behaviorMetadata,
          type: behaviorType,
          defaultName: behaviorMetadata.getDefaultName(),
          fullName: behaviorMetadata.getFullName(),
          description: behaviorMetadata.getDescription(),
          previewIconUrl: behaviorMetadata.getIconFilename(),
          objectType: behaviorMetadata.getObjectType(),
          category: extension.getCategory(),
          tags: extension.getTags().toJSArray(),
        }));
    })
  );
};

export const filterEnumeratedBehaviorMetadata = (
  list: Array<EnumeratedBehaviorMetadata>,
  searchText: string
): Array<EnumeratedBehaviorMetadata> => {
  if (!searchText) return list;

  const lowercaseSearchText = searchText.toLowerCase();

  return list.filter(enumerateBehaviorsMetadata => {
    return (
      enumerateBehaviorsMetadata.fullName
        .toLowerCase()
        .indexOf(lowercaseSearchText) !== -1 ||
      enumerateBehaviorsMetadata.description
        .toLowerCase()
        .indexOf(lowercaseSearchText) !== -1
    );
  });
};
