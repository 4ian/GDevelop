// @flow
import getObjectByName from './GetObjectByName';

const gd: libGDevelop = global.gd;

export default function checkHasRequiredCapabilities({
  platform,
  globalObjectsContainer,
  objectsContainer,
  requiredObjectCapabilities,
  objectName,
}: {|
  platform: ?gdPlatform,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  requiredObjectCapabilities: Array<string>,
  objectName: string,
|}) {
  if (!requiredObjectCapabilities || !platform) return true;

  const object = getObjectByName(
    globalObjectsContainer,
    objectsContainer,
    objectName
  );
  if (!object) {
    // Either the object does not exist or it's a group - not a problem because:
    // - if the object does not exist, we can't know its capabilities, we assume it has all.
    // - a group is assumed to have all the capabilities.
    return true;
  }

  const objectMetadata = gd.MetadataProvider.getObjectMetadata(
    platform,
    object.getType()
  );
  return requiredObjectCapabilities.every(requiredObjectCapability =>
    objectMetadata.isSupportedBaseObjectCapability(requiredObjectCapability)
  );
}
