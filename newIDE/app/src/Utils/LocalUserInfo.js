// @flow
import optionalRequire from './OptionalRequire';
const os = optionalRequire('os');

// $FlowFixMe[signature-verification-failure]
export const getUID = () => {
  try {
    return os.userInfo().uid;
  } catch (e) {
    return '';
  }
};
