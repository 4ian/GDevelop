// @flow
// See https://gist.github.com/jed/982883
// $FlowFixMe[missing-local-annot]
const generateUUID = (a): string => {
  return a
    ? // eslint-disable-next-line
      (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
    : // $FlowFixMe[incompatible-type]
      String([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, generateUUID);
};

const localStorageKey = 'gd-user-uuid';
let currentUserUuid: ?string = null;

export const resetUserUUID = (): string => {
  const newUserUUID = generateUUID();
  try {
    // $FlowFixMe[cannot-resolve-name]
    localStorage.setItem(localStorageKey, newUserUUID);
  } catch (e) {
    console.warn('Unable to save a new user UUID', e);
  }
  currentUserUuid = newUserUUID;
  return currentUserUuid;
};

export const getUserUUID = (): string => {
  if (currentUserUuid) return currentUserUuid;

  try {
    // $FlowFixMe[cannot-resolve-name]
    const storedUserUUID = localStorage.getItem(localStorageKey);
    if (storedUserUUID) {
      currentUserUuid = storedUserUUID;
      return storedUserUUID;
    }
  } catch (e) {
    console.warn('Unable to load stored user UUID', e);
  }

  return resetUserUUID();
};
