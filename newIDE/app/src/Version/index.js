// @flow
import VersionMetadata from './VersionMetadata';
const process = require('process');

export const getIDEVersion = (): string => VersionMetadata.version;
export const getIDEVersionWithHash = (): string =>
  VersionMetadata.versionWithHash;

let gdCoreVersionString = '';
export const getGDCoreVersion = (): string => {
  if (gdCoreVersionString) return gdCoreVersionString;

  const gd = global.gd;
  gdCoreVersionString = gd ? gd.VersionWrapper.fullString() : 'Unknown';
  return gdCoreVersionString;
};

export const getPlatform = (): string => {
  let platformString;
  if (process.platform === 'darwin') {
    platformString = 'macOS';
  } else {
    platformString = process.platform;
  }

  return platformString;
};

export const getSystemVersion = (): string => {
  return process.getSystemVersion
};

export const getArch = (): string => {
  return process.arch;
};
