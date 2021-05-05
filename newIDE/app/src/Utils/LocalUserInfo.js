// @flow
import optionalRequire from './OptionalRequire.js';
const os = optionalRequire('os');

const getUID = () => {
  try {
    return os.userInfo().uid;
  } catch (e) {
    return '';
  }
};

export default getUID;
