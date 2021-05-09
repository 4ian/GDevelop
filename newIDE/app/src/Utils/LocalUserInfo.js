// @flow
import optionalRequire from './OptionalRequire.js';
const os = optionalRequire('os');

export const getUID = () => {
  try {
    return os.userInfo().uid;
  } catch (e) {
    return '';
  }
};
