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

const shouldShow3DContent = (): boolean => {
  try {
    if (typeof localStorage === 'undefined') return true;
    const persistedState = localStorage.getItem('gd-preferences');
    if (!persistedState) return true;
    const values = JSON.parse(persistedState);
    return values.use3DEditor !== false;
  } catch (_e) {
    return true;
  }
};

const is3DValue = (value: ?string): boolean =>
  !!value && value.toLowerCase().includes('3d');

const shouldHideBehaviorIn2DMode = ({
  behaviorType,
  behaviorMetadata,
}: {|
  behaviorType: string,
  behaviorMetadata: gdBehaviorMetadata,
|}): boolean =>
  is3DValue(behaviorType) ||
  is3DValue(behaviorMetadata.getName()) ||
  is3DValue(behaviorMetadata.getObjectType());

export const enumerateBehaviorsMetadata = (
  platform: gdPlatform,
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null
): Array<EnumeratedBehaviorMetadata> => {
  const show3DContent = shouldShow3DContent();
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
        .filter(({ behaviorType, behaviorMetadata }) =>
          show3DContent
            ? true
            : !shouldHideBehaviorIn2DMode({ behaviorType, behaviorMetadata })
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

export const isBehaviorDefaultCapability = (
  behaviorMetadata: gdBehaviorMetadata
): boolean => {
  return (
    behaviorMetadata.getName().includes('Capability') ||
    behaviorMetadata.getName() === 'Scene3D::Base3DBehavior'
  );
};
