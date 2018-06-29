// See https://gist.github.com/jed/982883
const generateUUID = a => {
  return a
    ? // eslint-disable-next-line
      (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
    : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, generateUUID);
};

const localStorageKey = 'gd-user-uuid';

export const getUserUUID = () => {
  try {
    const existingUserUUID = localStorage.getItem(localStorageKey);
    if (existingUserUUID) return existingUserUUID;
  } catch (e) {
    console.warn('Unable to load stored user UUID', e);
  }

  const newUserUUID = generateUUID();
  try {
    localStorage.setItem(localStorageKey, newUserUUID);
  } catch (e) {
    console.warn('Unable to save user UUID', e);
  }
  return newUserUUID;
};
