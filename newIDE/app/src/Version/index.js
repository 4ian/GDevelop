// @flow
import VersionMetadata from './VersionMetadata';
const gd = global.gd;

const gdCoreVersionString: string = gd
  ? gd.VersionWrapper.fullString()
  : 'Unknown';

export const getIDEVersion = (): string => VersionMetadata.version;
export const getGDCoreVersion = (): string => gdCoreVersionString;
