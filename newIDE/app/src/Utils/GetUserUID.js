// @flow
import optionalRequire from './OptionalRequire.js';
var os = optionalRequire('os');

const getUID = () => {
    try {
        return os.userInfo().uid;
    } catch (e) {
        return '';
    }
};

export default getUID;

