// @flow
import optionalRequire from './OptionalRequire';
const os = optionalRequire('os');

export const getUID = (): any | string => {
  try {
    return os.userInfo().uid;
  } catch (e) {
    return '';
  }
};
