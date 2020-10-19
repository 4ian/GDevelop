// @flow
import VersionMetadata from './VersionMetadata';

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
