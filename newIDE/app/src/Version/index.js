// @flow
import VersionMetadata from './VersionMetadata';
import semverLowerThan from 'semver/functions/lt';

export const getIDEVersion = (): string => VersionMetadata.version;
export const getIDEVersionWithHash = (): string =>
  VersionMetadata.versionWithHash;

let gdCoreVersionString = '';
export const getGDCoreVersion = (): string => {
  if (gdCoreVersionString) return gdCoreVersionString;

  const gd: libGDevelop = global.gd;
  gdCoreVersionString = gd ? gd.VersionWrapper.fullString() : 'Unknown';
  return gdCoreVersionString;
};

export const shouldHideExtension = (
  project: gdProject,
  extension: gdPlatformExtension
): boolean => {
  const initialGDVersion = project.getInitialGDVersion();
  return (
    !!initialGDVersion &&
    extension.isDeprecated() &&
    !semverLowerThan(extension.getDeprecationGDVersion(), initialGDVersion)
  );
};
