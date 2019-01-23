// @flow
import optionalRequire from '../Utils/OptionalRequire';
const electron = optionalRequire('electron');
const app = electron ? electron.remote.app : null;
const gd = global.gd;

const gdCoreVersionString: string = gd
  ? gd.VersionWrapper.fullString()
  : 'Unknown';
const ideVersionString: string = app ? app.getVersion() : '5';

export const getIDEVersion = () => ideVersionString;
export const getGDCoreVersion = () => gdCoreVersionString;
